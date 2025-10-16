from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from datetime import date


# Hospital (SQL) models
class Patient(BaseModel):
    patient_id: Optional[int] = None
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    address: str
    phone: str
    email: Optional[str] = None


class Doctor(BaseModel):
    doctor_id: Optional[int] = None
    first_name: str
    last_name: str
    specialization: str
    phone: str
    email: str


class MedicalRecord(BaseModel):
    record_id: Optional[int] = None
    patient_id: int
    doctor_id: int
    diagnosis: str
    treatment: str
    notes: Optional[str] = None
    record_date: str


# Insurance (Neo4j) models
class InsurancePolicy(BaseModel):
    policy_id: str
    patient_id: int
    provider: str
    policy_number: str
    coverage_type: str
    start_date: str
    end_date: str
    coverage_details: Dict[str, Any]


class Claim(BaseModel):
    claim_id: Optional[str] = None
    policy_id: str
    record_id: int
    claim_date: str
    amount: float
    status: str = "Pending"
    description: str


# Federated models (combining data from both sources)
class PatientComplete(BaseModel):
    patient_info: Patient
    insurance_policies: List[InsurancePolicy]
    medical_records: List[MedicalRecord]
    claims: List[Claim]


class ClaimComplete(BaseModel):
    claim_info: Claim
    policy_info: InsurancePolicy
    medical_record: MedicalRecord
    patient_info: Patient