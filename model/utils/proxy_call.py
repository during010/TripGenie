import requests
import json
import logging
import os

from openai import OpenAI

class OpenaiCall:
    def __init__(self):
        self.client  = OpenAI(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key="62d0f993-0662-4e9e-9ab9-dc8f21999cca",
    )   

    def chat(self, messages, model="deepseek-v3-250324", temperature=0):
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature
        )
        return response.choices[0].message.content

    def stream_chat(self, messages, model="deepseek-r1-250528", temperature=0):
        for chunk in self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            stream=True
        ):
            yield chunk.choices[0].delta.content
    
    def embedding(self, input_data):
        response = self.client.embeddings.create(
            input=input_data,
            model="doubao-embedding-large-text-240915"
        )

        return response