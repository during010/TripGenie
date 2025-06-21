import pandas as pd
from pyproj import Proj, transform


def convert_lonlat_to_xy(input_csv, output_csv):
    df = pd.read_csv(input_csv)
    wgs84 = Proj(proj="latlong", datum="WGS84")
    mercator = Proj(init="epsg:3857")
    df['x'], df['y'] = zip(*df.apply(lambda row: transform(wgs84, mercator, row['lon'], row['lat']), axis=1))
    df.to_csv(output_csv, index=False)
    print(f"转换完成，结果已保存至 {output_csv}")


convert_lonlat_to_xy('C:/Users/dylll/Desktop/ITINERA-main/model/data/jinan_zh.csv', 'C:/Users/dylll/Desktop/ITINERA-main/model/data/output.csv')
