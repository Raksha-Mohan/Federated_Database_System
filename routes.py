from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import json
import pyodbc
from datetime import datetime, date
from database import get_sql_connection, Neo4jConnection
from models import *

router = APIRouter()


# Helper function to convert SQL row to dict
def row_to_dict(row, cursor):
    return {column[0]: value for column, value in zip(cursor.description, row)}


# ----- HOSPITAL (SQL) ROUTES -----

# Get all patients
@router.get("/patients/", response_model=List[Patient])
async def get_patients():
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Patients")
    patients = []
    for row in cursor.fetchall():
        patient_dict = row_to_dict(row, cursor)
        patients.append(Patient(**patient_dict))
    cursor.close()
    conn.close()
    return patients


# Get a specific patient by ID
@router.get("/patients/{patient_id}", response_model=Patient)
async def get_patient(patient_id: int):
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Patients WHERE patient_id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient_dict = row_to_dict(row, cursor)
    cursor.close()
    conn.close()
    return Patient(**patient_dict)


# Create a new patient
@router.post("/patients/", response_model=Patient)
async def create_patient(patient: Patient):
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO Patients (first_name, last_name, date_of_birth, gender, address, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        patient.first_name, patient.last_name, patient.date_of_birth,
        patient.gender, patient.address, patient.phone, patient.email
    ))
    cursor.execute("SELECT @@IDENTITY AS ID")
    patient_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    # Return the created patient with ID
    patient.patient_id = patient_id
    return patient


# Update a patient
@router.put("/patients/{patient_id}", response_model=Patient)
async def update_patient(patient_id: int, patient: Patient):
    conn = get_sql_connection()
    cursor = conn.cursor()

    # First check if patient exists
    cursor.execute("SELECT * FROM Patients WHERE patient_id = ?", (patient_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    # Update patient
    cursor.execute("""
    UPDATE Patients 
    SET first_name = ?, last_name = ?, date_of_birth = ?, 
        gender = ?, address = ?, phone = ?, email = ?
    WHERE patient_id = ?
    """, (
        patient.first_name, patient.last_name, patient.date_of_birth,
        patient.gender, patient.address, patient.phone, patient.email,
        patient_id
    ))

    conn.commit()
    cursor.close()
    conn.close()

    # Set the ID in the return object
    patient.patient_id = patient_id
    return patient


# Delete a patient
@router.delete("/patients/{patient_id}", response_model=dict)
async def delete_patient(patient_id: int):
    conn = get_sql_connection()
    cursor = conn.cursor()

    # Check if patient exists
    cursor.execute("SELECT * FROM Patients WHERE patient_id = ?", (patient_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    # Delete patient
    cursor.execute("DELETE FROM Patients WHERE patient_id = ?", (patient_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"status": "success", "message": f"Patient {patient_id} deleted successfully"}


# Get all medical records for a patient
@router.get("/patients/{patient_id}/medical_records", response_model=List[MedicalRecord])
async def get_patient_medical_records(patient_id: int):
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM MedicalRecords WHERE patient_id = ?", (patient_id,))
    records = []
    for row in cursor.fetchall():
        record_dict = row_to_dict(row, cursor)
        # Fix: Convert date object to string if needed
        if isinstance(record_dict.get("record_date"), (datetime, date)):
            record_dict["record_date"] = record_dict["record_date"].isoformat()
        records.append(MedicalRecord(**record_dict))
    cursor.close()
    conn.close()
    return records


# Get a specific medical record by ID
@router.get("/medical_records/{record_id}", response_model=MedicalRecord)
async def get_medical_record(record_id: int):
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM MedicalRecords WHERE record_id = ?", (record_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Medical record not found")
    record_dict = row_to_dict(row, cursor)
    # Fix: Convert date object to string if needed
    if isinstance(record_dict.get("record_date"), (datetime, date)):
        record_dict["record_date"] = record_dict["record_date"].isoformat()
    cursor.close()
    conn.close()
    return MedicalRecord(**record_dict)


# Create a new medical record
@router.post("/medical_records/", response_model=MedicalRecord)
async def create_medical_record(record: MedicalRecord):
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, treatment, notes, record_date)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        record.patient_id, record.doctor_id, record.diagnosis,
        record.treatment, record.notes, record.record_date
    ))
    cursor.execute("SELECT @@IDENTITY AS ID")
    record_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    # Return the created record with ID
    record.record_id = record_id
    return record


# Update a medical record
@router.put("/medical_records/{record_id}", response_model=MedicalRecord)
async def update_medical_record(record_id: int, record: MedicalRecord):
    conn = get_sql_connection()
    cursor = conn.cursor()

    # Check if record exists
    cursor.execute("SELECT * FROM MedicalRecords WHERE record_id = ?", (record_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Medical record not found")

    # Update record
    cursor.execute("""
    UPDATE MedicalRecords 
    SET patient_id = ?, doctor_id = ?, diagnosis = ?, 
        treatment = ?, notes = ?, record_date = ?
    WHERE record_id = ?
    """, (
        record.patient_id, record.doctor_id, record.diagnosis,
        record.treatment, record.notes, record.record_date,
        record_id
    ))

    conn.commit()
    cursor.close()
    conn.close()

    # Set the ID in the return object
    record.record_id = record_id
    return record


# Delete a medical record
@router.delete("/medical_records/{record_id}", response_model=dict)
async def delete_medical_record(record_id: int):
    conn = get_sql_connection()
    cursor = conn.cursor()

    # Check if record exists
    cursor.execute("SELECT * FROM MedicalRecords WHERE record_id = ?", (record_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Medical record not found")

    # Delete record
    cursor.execute("DELETE FROM MedicalRecords WHERE record_id = ?", (record_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"status": "success", "message": f"Medical record {record_id} deleted successfully"}


# ----- INSURANCE (NEO4J) ROUTES -----

# Get all insurance policies for a patient
@router.get("/patients/{patient_id}/insurance_policies", response_model=List[InsurancePolicy])
async def get_patient_insurance_policies(patient_id: int):
    neo4j_conn = Neo4jConnection()
    result = neo4j_conn.query(
        "MATCH (p:InsurancePolicy) WHERE p.patient_id = $patient_id RETURN p",
        {"patient_id": patient_id}
    )

    policies = []
    for record in result:
        policy_node = record["p"]
        policy_dict = dict(policy_node)
        # Fix: Check if coverage_details exists before accessing it
        if "coverage_details" not in policy_dict:
            policy_dict["coverage_details"] = {}
        elif policy_dict["coverage_details"] is None:
            policy_dict["coverage_details"] = {}
        else:
            # Convert any Python objects to JSON-serializable types
            policy_dict["coverage_details"] = json.loads(json.dumps(policy_dict["coverage_details"]))
        policies.append(InsurancePolicy(**policy_dict))

    neo4j_conn.close()
    return policies


# Get a specific insurance policy by ID
@router.get("/insurance_policies/{policy_id}", response_model=InsurancePolicy)
async def get_insurance_policy(policy_id: str):
    neo4j_conn = Neo4jConnection()
    result = neo4j_conn.query(
        "MATCH (p:InsurancePolicy {policy_id: $policy_id}) RETURN p",
        {"policy_id": policy_id}
    )

    if not result:
        neo4j_conn.close()
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    policy_node = result[0]["p"]
    policy_dict = dict(policy_node)

    # Fix: Check if coverage_details exists before accessing it
    if "coverage_details" not in policy_dict:
        policy_dict["coverage_details"] = {}
    elif policy_dict["coverage_details"] is None:
        policy_dict["coverage_details"] = {}
    else:
        # Convert any Python objects to JSON-serializable types
        policy_dict["coverage_details"] = json.loads(json.dumps(policy_dict["coverage_details"]))

    neo4j_conn.close()
    return InsurancePolicy(**policy_dict)


# Create a new insurance policy
@router.post("/insurance_policies/", response_model=InsurancePolicy)
async def create_insurance_policy(policy: InsurancePolicy):
    neo4j_conn = Neo4jConnection()

    # Convert dictionary to string representation for Cypher
    coverage_details_str = json.dumps(policy.coverage_details)

    neo4j_conn.query("""
    CREATE (p:InsurancePolicy {
        policy_id: $policy_id,
        patient_id: $patient_id,
        provider: $provider,
        policy_number: $policy_number,
        coverage_type: $coverage_type,
        start_date: $start_date,
        end_date: $end_date,
        coverage_details: $coverage_details
    })
    RETURN p
    """, {
        "policy_id": policy.policy_id,
        "patient_id": policy.patient_id,
        "provider": policy.provider,
        "policy_number": policy.policy_number,
        "coverage_type": policy.coverage_type,
        "start_date": policy.start_date,
        "end_date": policy.end_date,
        "coverage_details": policy.coverage_details
    })

    neo4j_conn.close()
    return policy


# Update an insurance policy
@router.put("/insurance_policies/{policy_id}", response_model=InsurancePolicy)
async def update_insurance_policy(policy_id: str, policy: InsurancePolicy):
    neo4j_conn = Neo4jConnection()

    # Check if policy exists
    result = neo4j_conn.query(
        "MATCH (p:InsurancePolicy {policy_id: $policy_id}) RETURN p",
        {"policy_id": policy_id}
    )

    if not result:
        neo4j_conn.close()
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    # Update policy
    neo4j_conn.query("""
    MATCH (p:InsurancePolicy {policy_id: $policy_id})
    SET p.patient_id = $patient_id,
        p.provider = $provider,
        p.policy_number = $policy_number,
        p.coverage_type = $coverage_type,
        p.start_date = $start_date,
        p.end_date = $end_date,
        p.coverage_details = $coverage_details
    RETURN p
    """, {
        "policy_id": policy_id,
        "patient_id": policy.patient_id,
        "provider": policy.provider,
        "policy_number": policy.policy_number,
        "coverage_type": policy.coverage_type,
        "start_date": policy.start_date,
        "end_date": policy.end_date,
        "coverage_details": policy.coverage_details
    })

    neo4j_conn.close()
    # Set the ID in the return object
    policy.policy_id = policy_id
    return policy


# Delete an insurance policy
@router.delete("/insurance_policies/{policy_id}", response_model=dict)
async def delete_insurance_policy(policy_id: str):
    neo4j_conn = Neo4jConnection()

    # Check if policy exists
    result = neo4j_conn.query(
        "MATCH (p:InsurancePolicy {policy_id: $policy_id}) RETURN p",
        {"policy_id": policy_id}
    )

    if not result:
        neo4j_conn.close()
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    # Delete any claims associated with this policy first
    neo4j_conn.query(
        "MATCH (c:Claim)-[r:FILED_UNDER]->(p:InsurancePolicy {policy_id: $policy_id}) DETACH DELETE c",
        {"policy_id": policy_id}
    )

    # Delete policy
    neo4j_conn.query(
        "MATCH (p:InsurancePolicy {policy_id: $policy_id}) DELETE p",
        {"policy_id": policy_id}
    )

    neo4j_conn.close()
    return {"status": "success", "message": f"Insurance policy {policy_id} deleted successfully"}


# Get all claims for a patient
@router.get("/patients/{patient_id}/claims", response_model=List[Claim])
async def get_patient_claims(patient_id: int):
    neo4j_conn = Neo4jConnection()
    result = neo4j_conn.query("""
    MATCH (c:Claim)-[:FILED_UNDER]->(p:InsurancePolicy)
    WHERE p.patient_id = $patient_id
    RETURN c
    """, {"patient_id": patient_id})

    claims = []
    for record in result:
        claim_node = record["c"]
        claim_dict = dict(claim_node)
        claims.append(Claim(**claim_dict))

    neo4j_conn.close()
    return claims


# Get a specific claim by ID
@router.get("/claims/{claim_id}", response_model=Claim)
async def get_claim(claim_id: str):
    neo4j_conn = Neo4jConnection()
    result = neo4j_conn.query(
        "MATCH (c:Claim {claim_id: $claim_id}) RETURN c",
        {"claim_id": claim_id}
    )

    if not result:
        neo4j_conn.close()
        raise HTTPException(status_code=404, detail="Claim not found")

    claim_node = result[0]["c"]
    claim_dict = dict(claim_node)

    neo4j_conn.close()
    return Claim(**claim_dict)


# Create a new claim
@router.post("/claims/", response_model=Claim)
async def create_claim(claim: Claim):
    neo4j_conn = Neo4jConnection()

    # Generate a new claim ID if not provided
    if not claim.claim_id:
        # Get the count of existing claims and add 1
        result = neo4j_conn.query("MATCH (c:Claim) RETURN COUNT(c) as count")
        count = result[0]["count"]
        claim.claim_id = f"CLM{str(count + 1).zfill(3)}"

    neo4j_conn.query("""
    MATCH (p:InsurancePolicy {policy_id: $policy_id})
    CREATE (c:Claim {
        claim_id: $claim_id,
        policy_id: $policy_id,
        record_id: $record_id,
        claim_date: $claim_date,
        amount: $amount,
        status: $status,
        description: $description
    })
    CREATE (c)-[:FILED_UNDER]->(p)
    RETURN c
    """, {
        "claim_id": claim.claim_id,
        "policy_id": claim.policy_id,
        "record_id": claim.record_id,
        "claim_date": claim.claim_date,
        "amount": claim.amount,
        "status": claim.status,
        "description": claim.description
    })

    neo4j_conn.close()
    return claim


# Update a claim
@router.put("/claims/{claim_id}", response_model=Claim)
async def update_claim(claim_id: str, claim: Claim):
    neo4j_conn = Neo4jConnection()

    result = neo4j_conn.query("""
    MATCH (c:Claim {claim_id: $claim_id})
    SET c.policy_id = $policy_id,
        c.record_id = $record_id,
        c.claim_date = $claim_date,
        c.amount = $amount,
        c.status = $status,
        c.description = $description
    RETURN c
    """, {
        "claim_id": claim_id,
        "policy_id": claim.policy_id,
        "record_id": claim.record_id,
        "claim_date": claim.claim_date,
        "amount": claim.amount,
        "status": claim.status,
        "description": claim.description
    })

    if not result:
        neo4j_conn.close()
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    neo4j_conn.close()
    # Set the ID in the return object
    claim.claim_id = claim_id
    return claim


# Delete a claim
@router.delete("/claims/{claim_id}", response_model=dict)
async def delete_claim(claim_id: str):
    neo4j_conn = Neo4jConnection()

    # Check if claim exists
    result = neo4j_conn.query(
        "MATCH (c:Claim {claim_id: $claim_id}) RETURN c",
        {"claim_id": claim_id}
    )

    if not result:
        neo4j_conn.close()
        raise HTTPException(status_code=404, detail="Claim not found")

    # Delete claim
    neo4j_conn.query(
        "MATCH (c:Claim {claim_id: $claim_id}) DETACH DELETE c",
        {"claim_id": claim_id}
    )

    neo4j_conn.close()
    return {"status": "success", "message": f"Claim {claim_id} deleted successfully"}


# ----- FEDERATED ROUTES (COMBINING SQL AND NEO4J) -----

# Get complete patient information (from both databases)
@router.get("/patients/{patient_id}/complete", response_model=PatientComplete)
async def get_complete_patient(patient_id: int):
    # Get patient info from SQL
    patient = await get_patient(patient_id)

    # Get medical records from SQL
    medical_records = await get_patient_medical_records(patient_id)

    # Get insurance policies from Neo4j
    insurance_policies = await get_patient_insurance_policies(patient_id)

    # Get claims from Neo4j
    claims = await get_patient_claims(patient_id)

    # Combine all data
    complete_patient = PatientComplete(
        patient_info=patient,
        insurance_policies=insurance_policies,
        medical_records=medical_records,
        claims=claims
    )

    return complete_patient


# Get complete claim information (from both databases)
@router.get("/claims/{claim_id}/complete", response_model=ClaimComplete)
async def get_complete_claim(claim_id: str):
    # Get claim info from Neo4j
    neo4j_conn = Neo4jConnection()
    claim_result = neo4j_conn.query(
        "MATCH (c:Claim {claim_id: $claim_id}) RETURN c",
        {"claim_id": claim_id}
    )

    if not claim_result:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim_dict = dict(claim_result[0]["c"])
    claim = Claim(**claim_dict)

    # Get associated policy from Neo4j
    policy_result = neo4j_conn.query(
        "MATCH (c:Claim {claim_id: $claim_id})-[:FILED_UNDER]->(p:InsurancePolicy) RETURN p",
        {"claim_id": claim_id}
    )

    if not policy_result:
        raise HTTPException(status_code=404, detail="Associated policy not found")

    policy_dict = dict(policy_result[0]["p"])
    # Fix: Check if coverage_details exists before accessing it
    if "coverage_details" not in policy_dict:
        policy_dict["coverage_details"] = {}
    elif policy_dict["coverage_details"] is None:
        policy_dict["coverage_details"] = {}
    else:
        # Convert any Python objects to JSON-serializable types
        policy_dict["coverage_details"] = json.loads(json.dumps(policy_dict["coverage_details"]))

    policy = InsurancePolicy(**policy_dict)

    neo4j_conn.close()

    # Get medical record from SQL
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM MedicalRecords WHERE record_id = ?", (claim.record_id,))
    record_row = cursor.fetchone()

    if not record_row:
        raise HTTPException(status_code=404, detail="Associated medical record not found")

    record_dict = row_to_dict(record_row, cursor)
    # Fix: Convert date object to string if needed
    if isinstance(record_dict.get("record_date"), (datetime, date)):
        record_dict["record_date"] = record_dict["record_date"].isoformat()

    medical_record = MedicalRecord(**record_dict)

    # Get patient info from SQL
    cursor.execute("SELECT * FROM Patients WHERE patient_id = ?", (policy.patient_id,))
    patient_row = cursor.fetchone()

    if not patient_row:
        raise HTTPException(status_code=404, detail="Associated patient not found")

    patient_dict = row_to_dict(patient_row, cursor)
    patient = Patient(**patient_dict)

    cursor.close()
    conn.close()

    # Combine all data
    complete_claim = ClaimComplete(
        claim_info=claim,
        policy_info=policy,
        medical_record=medical_record,
        patient_info=patient
    )

    return complete_claim