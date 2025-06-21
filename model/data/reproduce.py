import openai
from openai import OpenAI
import numpy as np
import pandas as pd
import os
# Set your OpenAI API key
openai.api_key = "62d0f993-0662-4e9e-9ab9-dc8f21999cca"
client = OpenAI(
    # 此为默认路径，您可根据业务所在地域进行配置
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    # 从环境变量中获取您的 API Key
    api_key="62d0f993-0662-4e9e-9ab9-dc8f21999cca",
)

def csv_to_embeddings(input_csv, output_npy):
    # Read the CSV file
    df = pd.read_csv(input_csv)
    
    # Ensure the CSV has a column named 'text' for processing
    if 'context' not in df.columns:
        raise ValueError("The input CSV must contain a 'text' column.")
    
    # Generate embeddings for each text entry
    embeddings = []
    for text in df['context']:
        response = client.embeddings.create(input=text, model="doubao-embedding-large-text-240915")
        embeddings.append(response.data[0].embedding)
    
    # Save embeddings to an npy file
    np.save(output_npy, np.array(embeddings))

# Example usage
csv_to_embeddings("C:/Users/dylll/Desktop/ITINERA-main/model/data/jinan_zh.csv", "C:/Users/dylll/Desktop/ITINERA-main/model/data/jinan_zh.npy")