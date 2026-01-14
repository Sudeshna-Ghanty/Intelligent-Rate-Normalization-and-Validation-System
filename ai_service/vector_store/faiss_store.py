# ai-service/vector_store/faiss_store.py
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings


import os
import pickle

VECTOR_DIR = "vector_store/faiss_index"

class VectorStoreManager:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.index_path = VECTOR_DIR

        if os.path.exists(self.index_path):
            self.vector_store = FAISS.load_local(
                self.index_path,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        else:
            self.vector_store = FAISS.from_texts(
                texts=["initialization"],
                embedding=self.embeddings
            )
            self.vector_store.save_local(self.index_path)

    def add_documents(self, texts: list[str], metadatas: list[dict]):
        self.vector_store.add_texts(texts=texts, metadatas=metadatas)
        self.vector_store.save_local(self.index_path)

    def similarity_search(self, query: str, k: int = 5):
        return self.vector_store.similarity_search(query, k=k)
