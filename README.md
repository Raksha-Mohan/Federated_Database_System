# Federated_Database_System
Federated database application designed  to bridge the gap between healthcare providers and insurance companies. 


##  Overview

This project demonstrates a **Federated Database System** integrating **Hospital (Relational)** and **Insurance (Graph)** data to provide unified access to patient, medical record, policy, and claim information across multiple systems.

- **Hospital Data:** Stored in Microsoft SQL Server (relational).  
- **Insurance Data:** Stored in Neo4j (graph-based).  
- **Middleware:** FastAPI backend for CRUD and federated queries.  
- **Frontend:** React-based interface with role-based portals.

> This project showcases cross-database query federation, schema mapping, and secure CRUD operations.

---

##  Features

- Full **CRUD** operations for both SQL Server and Neo4j databases.  
- **Federated API endpoints** combining relational and graph data.  
- **Role-based React frontend** for hospital and insurance users.  
- **Pydantic validation** for API data integrity.  
- **Error handling and async operations** for robust performance.  
- Database initialization scripts with **sample data**.


## Tech Stack

| Layer | Technologies |
| **Backend** | Python, FastAPI, Pydantic, pyodbc, neo4j-driver |
| **Databases** | Microsoft SQL Server, Neo4j |
| **Frontend** | React (JavaScript/TypeScript) |
| **Dev Tools** | Uvicorn, npm/yarn, Docker (optional) |

---

##  Project Structure
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ routes.py
│  │  ├─ database.py
│  │  ├─ models.py
│  │  ├─ sql_scripts.py
│  │  └─ neo4j_scripts.py
│  └─ requirements.txt
├─ frontend/
│  ├─ package.json
│  ├─ src/
│  │  ├─ components/
│  │  └─ pages/
│  └─ README-frontend.md
├─ docs/
│  ├─ Raksha_Mohan_final_project.pdf
│  └─ RakshaMohan_FinalProjectPPT.pptx
└─ README.md

````

---

 Database Schemas

### SQL Server (Hospital)
**Tables:**
- `Patients(patient_id PK, first_name, last_name, date_of_birth, gender, address, phone, email)`
- `Doctors(doctor_id PK, first_name, last_name, specialization, phone, email)`
- `MedicalRecords(record_id PK, patient_id FK -> Patients, doctor_id FK -> Doctors, diagnosis, treatment, notes, record_date)`

### Neo4j (Insurance)
**Nodes and Relationships:**
- `(:InsurancePolicy { policy_id, patient_id, provider, policy_number, coverage_type, start_date, end_date, deductible, copay, max_out_of_pocket, coverage_percentage })`
- `(:Claim { claim_id, policy_id, record_id, claim_date, amount, status, description })`
- Relationship: `(:Claim)-[:FILED_UNDER]->(:InsurancePolicy)`

---

 Setup Instructions

 Prerequisites

- Python 3.10+  
- Node.js 16+ / npm or yarn  
- Microsoft SQL Server (local or Docker)  
- Neo4j (Desktop or Docker)  
- ODBC Driver 18 for SQL Server  

---

 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# SQL Server
MSSQL_SERVER=localhost
MSSQL_DATABASE=HospitalDB
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong!Passw0rd
MSSQL_DRIVER=ODBC Driver 18 for SQL Server

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j-password

# FastAPI
SECRET_KEY=supersecretkey
````

---
 Initialize Databases

**SQL Server**

```bash
python backend/app/sql_scripts.py
```

Creates tables and inserts sample data for HospitalDB.

**Neo4j**

```bash
python backend/app/neo4j_scripts.py
```

Creates InsurancePolicy and Claim nodes with relationships.

---
 Run the Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

 Run the Frontend (React)

```bash
cd frontend
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000)

 Example API Endpoints

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| `POST` | `/hospital/patients`       | Create patient (SQL Server)     |
| `GET`  | `/hospital/patients/{id}`  | Get patient + records           |
| `POST` | `/insurance/policies`      | Create insurance policy (Neo4j) |
| `GET`  | `/insurance/policies/{id}` | Get insurance policy            |
| `GET`  | `/federated/patients/{id}` | Combined patient & policy data  |

**Example:**

```bash
curl http://localhost:8000/federated/patients/123
```
---
##  Data Validation

* All request and response models use **Pydantic** for type safety.
* Federated responses merge relational and graph models seamlessly.

---

##  Testing

* Use `pytest` or FastAPI’s test client.
* Include test databases or mock connections in `backend/tests/`.

---

## Deployment Notes

* Each service (FastAPI, SQL Server, Neo4j, React) can be containerized.
* Use **Docker Compose** for orchestration.
* Secure credentials using environment variables or secret stores.
* Use HTTPS and configure proper CORS in production.

---

##  Limitations & Future Scope

* Replace demo authentication with **JWT/OAuth2**.
* Add **distributed transaction management** or **event-driven updates**.
* Extend to support **FHIR-compliant healthcare data exchange**.
* Implement **logging and monitoring** dashboards.

---

##  Contribution Guidelines

1. Fork this repo.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "Add new feature"`.
4. Push to your fork: `git push origin feature/your-feature`.
5. Open a pull request.

---

## 📚 References

* Microsoft SQL Server Docs
* Neo4j Graph Database Docs
* FastAPI Documentation
* React Documentation



