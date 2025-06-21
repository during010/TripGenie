import os
import numpy as np
import pandas as pd


class SearchEngine:
    def __init__(self, embedding: np.ndarray = None, emb_path: str = "", file_path: str = "", proxy = None):
        if embedding is not None:
            self.embedding = embedding
        else:    
            self.embedding = self.get_embeddings(emb_path=emb_path, file_path=file_path)
        self.proxy = proxy

    def top_k_cosine_similarity(self, A: np.ndarray = None, B: np.ndarray = None, k: int = None, indices: list = None):
        A_norm = A / np.linalg.norm(A)
        B_norm = B / np.linalg.norm(B, axis=1)[:, np.newaxis]

        cosine_similarities = np.dot(A_norm, B_norm.T)
        if indices is not None:
            mask = np.ones(cosine_similarities.shape, dtype=bool)
            mask[0][indices] = False
            cosine_similarities[0][mask[0]] = -np.inf

        top_k_indices = np.argsort(cosine_similarities[0])[::-1][:k]

        top_k_similarities = cosine_similarities[0][top_k_indices]

        return top_k_indices, top_k_similarities


    def get_embeddings(self, emb_path: str = "", file_path: str = "") -> None: 

        if os.path.exists(emb_path):
            embedding = np.load(emb_path)
        else:
            data = pd.read_csv(file_path)
            context = data['name'].astype(str) + "，地址是" + data['address'].astype(str) + "，" + data['desc'].astype(str)
            res_records = self.proxy.embedding(input_data=context.tolist())
            embedding = np.array([np.array(record["embedding"]) for record in res_records["data"]])
            np.save(emb_path, embedding)

        return embedding

    def query(self, desc: tuple = None, top_k: int = None):

        pos_desc, neg_desc = desc

        pos_res = self.proxy.embedding(input_data=f"{pos_desc}")
        try:
            pos_embedding = np.array([np.array(record["embedding"]) for record in pos_res["data"]])
        except:
            pos_embedding = np.array([np.array(record.embedding) for record in pos_res.data])

        indices, similarities = self.top_k_cosine_similarity(pos_embedding, self.embedding, k=100000000)
            
        if neg_desc not in [None, ""]:
            sorted_indices = np.argsort(indices)
            indices = indices[sorted_indices]
            similarities = similarities[sorted_indices]

            neg_res = self.proxy.embedding(input_data=f"{neg_desc}")
            try:
                neg_embedding = np.array([np.array(record["embedding"]) for record in neg_res["data"]])
            except:
                neg_embedding = np.array([np.array(record.embedding) for record in neg_res.data])
            neg_indices, neg_similarities = self.top_k_cosine_similarity(neg_embedding, self.embedding, k=100000000, indices=indices)
            
            sorted_indices = np.argsort(neg_indices)
            neg_indices = neg_indices[sorted_indices]
            neg_similarities = neg_similarities[sorted_indices]

            mean_similarity = np.mean(similarities)
            
            for i in range(len(neg_similarities)):
                similarities[i] -= neg_similarities[i]
            similarities += (mean_similarity - np.mean(similarities)) # back to original similarities.

            sorted_indices = np.argsort(similarities)[::-1]
            indices = indices[sorted_indices]
            similarities = similarities[sorted_indices]
        
        result = np.concatenate((indices[:, np.newaxis], similarities[:, np.newaxis]), axis=1)

        return result


