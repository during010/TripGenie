import os
import math
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from thefuzz import process


def get_user_data_embedding(city_name, must_see_poi_names, type='zh'):
    data = pd.read_csv(os.path.join("model", "data", f'{city_name}_{type}.csv'))

    embedding = np.load(os.path.join("model", "data", f'{city_name}_{type}.npy'))

    all_poi_names = data["name"].tolist()
    must_see_pois = []

    for must_see_poi_name in must_see_poi_names:
        match, score = process.extract(must_see_poi_name, all_poi_names, limit=1)[0]
        if score > 91:
            must_see_pois.append(all_poi_names.index(match))

    data = data.reset_index(drop=True)

    row_idx = data.index.to_numpy()
    id = data["id"].to_numpy()

    r2i = {key: value for key, value in zip(row_idx, id)}
    i2r = {value: key for key, value in zip(row_idx, id)}

    return data, embedding, r2i, i2r, must_see_pois


class RecurringList:
    def __init__(self, lst):
        self.lst = lst

    def __getitem__(self, index):
        if isinstance(index, slice):
            start = index.start if index.start is not None else 0
            stop = index.stop if index.stop is not None else len(self.lst)
            step = index.step if index.step is not None else 1

            return [self.lst[i % len(self.lst)] for i in range(start, stop, step)]
        else:
            return self.lst[index % len(self.lst)]

    def __len__(self):
        return len(self.lst)


def compute_consecutive_distances(points: np.ndarray, indices: list) -> np.ndarray:
    relevant_points = points[indices]
    differences = relevant_points[1:] - relevant_points[:-1]
    return np.sqrt(np.sum(differences ** 2, axis=1))


def find_indices(lst: list, value: any) -> list:
    return [index for index, element in enumerate(lst) if element == value][0]


def sample_items(A: list, B: list, selected_clusters: list, threshold: int = 900, keep_prob: float = 0.8,
                 keep_ids: list = None):
    keep_indices = [i for i, score in enumerate(B) if score > threshold or A[i] in keep_ids]
    remaining_indices = [i for i in range(len(B)) if i not in keep_indices]
    remaining_scores = np.array([B[i] for i in remaining_indices])
    if np.sum(remaining_scores) == 0:
        sample_size = int(len(remaining_indices) * keep_prob)
        sampled_indices = np.random.choice(remaining_indices, size=sample_size, replace=False)
    else:
        normalized_scores = remaining_scores / np.sum(remaining_scores)
        sampled_indices = np.random.choice(remaining_indices, size=int(len(remaining_indices) * keep_prob),
                                           p=normalized_scores, replace=False)

    final_indices = keep_indices + list(sampled_indices)

    A_new = [A[i] for i in final_indices]
    B_new = [B[i] for i in final_indices]

    idx, newselected_clusters = 0, []
    for cluster in selected_clusters:
        newSelectedCluster = []
        for point in cluster:
            if idx in final_indices:
                newSelectedCluster.append(point)
            idx += 1
        newselected_clusters.append(newSelectedCluster)

    return A_new, B_new, newselected_clusters


def reorder_list(A: list, B: list) -> np.ndarray:
    flattened_B = [item for sublist in B for item in sublist]
    order_indices = [A.index(val) for val in flattened_B if val in A]

    return np.array(order_indices)


def remove_duplicates(input_list: list) -> list:
    unique_list = []
    for item in input_list:
        if item not in unique_list:
            unique_list.append(item)
    return unique_list


def convert_to_mercator(lon, lat):

    point = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326")

    point_mercator = point.to_crs("EPSG:3857")

    x = point_mercator.geometry.x.iloc[0]
    y = point_mercator.geometry.y.iloc[0]

    return x, y


def get_max_summation_idx(A: list, B: np.ndarray) -> int:

    max_sum = 0
    max_idx = 0

    for idx, s in enumerate(A):
        total = sum([B[B[:, 0] == item][0, 1] for item in s])

        if total > max_sum:
            max_sum = total
            max_idx = idx

    return max_idx


def get_top_k_sets(A: list, B: np.ndarray, k: int = 2) -> list:

    set_sums = {}
    for idx, set_elem in enumerate(A):
        total_value = 0
        for item in set_elem:
            corresponding_value = B[np.where(B[:, 0] == item)][0, 1]
            total_value += corresponding_value
        set_sums[idx] = total_value
    top_k_sets = sorted(set_sums, key=set_sums.get, reverse=True)[:k]

    return top_k_sets


def get_topk_location_pairs(A: np.ndarray, B: np.ndarray, k: int) -> np.ndarray:

    distances = np.sqrt(np.sum((A[:, np.newaxis] - B) ** 2, axis=2))
    if distances.shape[0] == 1:
        idx = 0
    else:
        idx = np.argpartition(distances, k, axis=None)[:k]
    idx = np.unravel_index(idx, distances.shape)
    idx = np.column_stack(idx).reshape(k, 2)

    return idx


def find_clusters_containing_all_elements(A: list, B: list) -> list:

    cluster_indexes = []

    for idx, cluster in enumerate(A):
        for pointId in B:
            if pointId in cluster:
                cluster_indexes.append(idx)
                break

    return cluster_indexes
