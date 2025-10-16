import os
import pyodbc
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# SQL Server Connection
def get_sql_connection():
    try:
        conn = pyodbc.connect(
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={os.getenv('SQL_SERVER')};"
            f"DATABASE={os.getenv('SQL_DATABASE')};"
            f"UID={os.getenv('SQL_USERNAME')};"
            f"PWD={os.getenv('SQL_PASSWORD')}"
        )
        return conn
    except Exception as e:
        print(f"Error connecting to SQL Server: {e}")
        return None


# Neo4j Connection
class Neo4jConnection:
    def __init__(self):
        self.driver = None
        try:
            self.driver = GraphDatabase.driver(
                os.getenv("NEO4J_URI"),
                auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
            )
        except Exception as e:
            print(f"Error connecting to Neo4j: {e}")

    def close(self):
        if self.driver:
            self.driver.close()

    def query(self, query, parameters=None):
        assert self.driver is not None, "Driver not initialized!"
        session = None
        response = None
        try:
            session = self.driver.session()
            response = list(session.run(query, parameters))
        except Exception as e:
            print(f"Query failed: {e}")
        finally:
            if session:
                session.close()
        return response


# Test connections
def test_connections():
    # Test SQL connection
    sql_conn = get_sql_connection()
    if sql_conn:
        print("SQL Server connection successful!")
        sql_conn.close()
    else:
        print("SQL Server connection failed!")

    # Test Neo4j connection
    neo4j_conn = Neo4jConnection()
    if neo4j_conn.driver:
        print("Neo4j connection successful!")
        neo4j_conn.close()
    else:
        print("Neo4j connection failed!")


if __name__ == "__main__":
    test_connections()