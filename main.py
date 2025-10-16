from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routes import router
import sql_scripts
import neo4j_scripts

# Create FastAPI app
app = FastAPI(
    title="Healthcare and Insurance Integration System",
    description="A federated database system connecting healthcare providers and insurance companies",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routes
app.include_router(router, prefix="/api")


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the Healthcare and Insurance Integration System",
        "documentation": "/docs",
        "available_endpoints": [
            "/api/patients/",
            "/api/patients/{patient_id}",
            "/api/patients/{patient_id}/medical_records",
            "/api/patients/{patient_id}/insurance_policies",
            "/api/patients/{patient_id}/claims",
            "/api/patients/{patient_id}/complete",
            "/api/medical_records/",
            "/api/insurance_policies/",
            "/api/claims/",
            "/api/claims/{claim_id}/complete"
        ]
    }


# Initialize database function
def init_db():
    print("Initializing databases...")
    try:
        # Create SQL Server database
        sql_scripts.create_hospital_database()

        # Create Neo4j database
        neo4j_scripts.create_insurance_database()

        print("Databases initialized successfully!")
    except Exception as e:
        print(f"Error initializing databases: {e}")


# Run the application
if __name__ == "__main__":
    init_db()  # Initialize databases before starting the app
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)