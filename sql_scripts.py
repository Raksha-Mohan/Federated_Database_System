from database import get_sql_connection
import datetime
import random
import logging


def create_hospital_database():
    """Create all necessary tables for the hospital database if they don't exist."""
    conn = get_sql_connection()
    cursor = conn.cursor()

    # Check if Patients table exists
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Patients')
    BEGIN
        CREATE TABLE Patients (
            patient_id INT PRIMARY KEY IDENTITY(1,1),
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            date_of_birth DATE,
            gender VARCHAR(20),
            address VARCHAR(255),
            phone VARCHAR(20),
            email VARCHAR(100)
        )
    END
    """)

    # Check if Doctors table exists
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Doctors')
    BEGIN
        CREATE TABLE Doctors (
            doctor_id INT PRIMARY KEY IDENTITY(1,1),
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            specialization VARCHAR(100),
            phone VARCHAR(20),
            email VARCHAR(100)
        )
    END
    """)

    # Check if MedicalRecords table exists
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicalRecords')
    BEGIN
        CREATE TABLE MedicalRecords (
            record_id INT PRIMARY KEY IDENTITY(1,1),
            patient_id INT NOT NULL,
            doctor_id INT NOT NULL,
            diagnosis VARCHAR(255),
            treatment VARCHAR(MAX),
            notes VARCHAR(MAX),
            record_date DATE,
            FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
            FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
        )
    END
    """)

    conn.commit()
    print("Database tables created or already exist.")

    cursor.close()
    conn.close()


def insert_hospital_data():
    """Insert sample data into the hospital database."""
    conn = get_sql_connection()
    cursor = conn.cursor()

    # ---- PATIENTS ----
    # 20 diverse patients with realistic data
    patients = [
        ('James', 'Wilson', '1975-08-23', 'Male', '742 Evergreen Terrace, Springfield', '555-101-2020',
         'jwilson@email.com'),
        ('Maria', 'Garcia', '1988-04-17', 'Female', '1234 Oak Street, Riverdale', '555-222-3434', 'mgarcia@email.com'),
        ('David', 'Chen', '1992-11-05', 'Male', '567 Maple Drive, Lakeside', '555-333-4545', 'dchen@email.com'),
        ('Aisha', 'Johnson', '1980-02-14', 'Female', '890 Pine Avenue, Westview', '555-444-5656', 'ajohnson@email.com'),
        ('Michael', 'Patel', '1965-07-30', 'Male', '321 Cedar Lane, Eastwood', '555-555-6767', 'mpatel@email.com'),
        ('Sarah', 'Nguyen', '1995-09-12', 'Female', '654 Birch Street, Northside', '555-666-7878', 'snguyen@email.com'),
        ('Luis', 'Rodriguez', '1978-03-25', 'Male', '987 Elm Road, Southport', '555-777-8989', 'lrodriguez@email.com'),
        ('Emily', 'Thompson', '1990-12-08', 'Female', '159 Willow Way, Centertown', '555-888-9090',
         'ethompson@email.com'),
        ('Omar', 'Ahmed', '1983-05-19', 'Male', '753 Aspen Court, Hillcrest', '555-999-0101', 'oahmed@email.com'),
        ('Grace', 'Kim', '1972-10-31', 'Female', '426 Sycamore Lane, Valleyview', '555-121-2323', 'gkim@email.com'),
        ('Samuel', 'Jackson', '1986-01-07', 'Male', '359 Chestnut Street, Harborside', '555-232-3434',
         'sjackson@email.com'),
        ('Sophia', 'Martinez', '1998-06-22', 'Female', '864 Redwood Drive, Mountainview', '555-343-4545',
         'smartinez@email.com'),
        ('Daniel', 'Lee', '1969-04-15', 'Male', '137 Beech Avenue, Foresthill', '555-454-5656', 'dlee@email.com'),
        ('Isabella', 'Wong', '1993-08-03', 'Female', '248 Hawthorn Road, Riverside', '555-565-6767', 'iwong@email.com'),
        ('Ethan', 'Sharma', '1982-11-27', 'Male', '579 Poplar Street, Lakefront', '555-676-7878', 'esharma@email.com'),
        ('Olivia', 'Brown', '1997-02-11', 'Female', '680 Cypress Lane, Brookside', '555-787-8989', 'obrown@email.com'),
        ('Marcus', 'Campbell', '1964-07-08', 'Male', '791 Juniper Court, Highland', '555-898-9090',
         'mcampbell@email.com'),
        ('Zoe', 'Taylor', '1989-12-19', 'Female', '802 Spruce Way, Seaside', '555-909-0101', 'ztaylor@email.com'),
        ('Ricardo', 'Hernandez', '1976-05-02', 'Male', '913 Cherry Street, Midtown', '555-010-1212',
         'rhernandez@email.com'),
        ('Amara', 'Wilson', '2001-09-14', 'Female', '024 Magnolia Drive, Downtown', '555-212-2323', 'awilson@email.com')
    ]

    # Insert patients only if they don't already exist
    for patient in patients:
        first_name, last_name = patient[0], patient[1]
        # Check if patient already exists
        cursor.execute("SELECT COUNT(*) FROM Patients WHERE first_name = ? AND last_name = ?",
                       (first_name, last_name))
        if cursor.fetchone()[0] == 0:
            # Insert new patient
            patient_insert_query = """
            INSERT INTO Patients (first_name, last_name, date_of_birth, gender, address, phone, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(patient_insert_query, patient)

    conn.commit()
    print("Patients inserted successfully!")

    # ---- DOCTORS ----
    # 10 doctors with different specializations
    doctors = [
        ('Sarah', 'Williams', 'Cardiology', '555-222-3333', 'dr.williams@hospital.com'),
        ('Michael', 'Brown', 'Orthopedics', '555-444-5555', 'dr.brown@hospital.com'),
        ('Emily', 'Davis', 'Pediatrics', '555-666-7777', 'dr.davis@hospital.com'),
        ('Rajiv', 'Patel', 'Neurology', '555-888-9999', 'dr.patel@hospital.com'),
        ('Jennifer', 'Lopez', 'Dermatology', '555-111-2222', 'dr.lopez@hospital.com'),
        ('Mohammed', 'Ali', 'Internal Medicine', '555-333-4444', 'dr.ali@hospital.com'),
        ('Katherine', 'Chen', 'Oncology', '555-555-6666', 'dr.chen@hospital.com'),
        ('Jonathan', 'Taylor', 'Psychiatry', '555-777-8888', 'dr.taylor@hospital.com'),
        ('Elena', 'Rodriguez', 'Endocrinology', '555-999-1111', 'dr.rodriguez@hospital.com'),
        ('David', 'Kim', 'Gastroenterology', '555-222-4444', 'dr.kim@hospital.com')
    ]

    # Insert doctors only if they don't already exist
    for doctor in doctors:
        first_name, last_name = doctor[0], doctor[1]
        # Check if doctor already exists
        cursor.execute("SELECT COUNT(*) FROM Doctors WHERE first_name = ? AND last_name = ?",
                       (first_name, last_name))
        if cursor.fetchone()[0] == 0:
            # Insert new doctor
            doctor_insert_query = """
            INSERT INTO Doctors (first_name, last_name, specialization, phone, email)
            VALUES (?, ?, ?, ?, ?)
            """
            cursor.execute(doctor_insert_query, doctor)

    conn.commit()
    print("Doctors inserted successfully!")

    # ---- MEDICAL RECORDS ----
    # Diagnoses and treatments for different specialties
    diagnoses_treatments = [
        # Cardiology
        ('Hypertension', 'Prescribed Lisinopril 10mg daily, dietary modifications, exercise regimen'),
        ('Atrial Fibrillation', 'Prescribed Eliquis 5mg twice daily, ECG monitoring'),
        ('Coronary Artery Disease', 'Prescribed Atorvastatin 40mg, scheduled stress test'),
        ('Heart Failure', 'Prescribed Furosemide 20mg, ACE inhibitor, fluid restriction'),

        # Orthopedics
        ('Osteoarthritis', 'Prescribed Meloxicam 15mg, physical therapy, joint injection'),
        ('Lumbar Disc Herniation', 'Prescribed muscle relaxants, physical therapy, MRI ordered'),
        ('Rotator Cuff Tear', 'Recommended RICE therapy, scheduled for surgical evaluation'),
        ('Ankle Sprain', 'RICE protocol, ankle brace, crutches for 1 week'),

        # Pediatrics
        ('Acute Otitis Media', 'Prescribed Amoxicillin 400mg/5ml, follow-up in 10 days'),
        ('Childhood Asthma', 'Prescribed Albuterol inhaler, asthma action plan provided'),
        ('Strep Throat', 'Prescribed Augmentin 500mg, throat lozenges for comfort'),
        ('ADHD', 'Started on Methylphenidate 10mg, behavioral therapy recommended'),

        # Neurology
        ('Migraine', 'Prescribed Sumatriptan 50mg, migraine diary, trigger avoidance'),
        ('Multiple Sclerosis', 'Started on Tecfidera, vitamin D supplementation, MRI scheduled'),
        ('Epilepsy', 'Prescribed Keppra 500mg twice daily, seizure precautions discussed'),
        ('Parkinson\'s Disease', 'Started on Carbidopa/Levodopa, physical therapy referral'),

        # Dermatology
        ('Psoriasis', 'Prescribed topical steroids, UV therapy scheduled'),
        ('Acne Vulgaris', 'Prescribed Tretinoin cream, benzoyl peroxide wash'),
        ('Eczema', 'Prescribed Triamcinolone cream, moisturizing regimen'),
        ('Rosacea', 'Prescribed Metronidazole gel, trigger avoidance counseling'),

        # Internal Medicine
        ('Type 2 Diabetes', 'Prescribed Metformin 1000mg, glucose monitoring, dietary counseling'),
        ('COPD', 'Prescribed Symbicort inhaler, smoking cessation counseling'),
        ('Hypothyroidism', 'Prescribed Levothyroxine 50mcg, TSH monitoring'),
        ('Anemia', 'Prescribed ferrous sulfate, dietary recommendations, CBC in 3 months'),

        # Oncology
        ('Breast Cancer', 'Scheduled for lumpectomy, oncology consult for chemotherapy'),
        ('Prostate Cancer', 'PSA monitoring, scheduled for radiation therapy consultation'),
        ('Lymphoma', 'Chemotherapy regimen initiated, supportive care plan'),
        ('Colorectal Cancer', 'Post-surgical follow-up, chemotherapy schedule established'),

        # Psychiatry
        ('Major Depressive Disorder', 'Prescribed Sertraline 50mg, cognitive behavioral therapy'),
        ('Generalized Anxiety Disorder', 'Prescribed Buspirone 10mg, relaxation techniques'),
        ('Bipolar Disorder', 'Prescribed Lamotrigine 100mg, mood charting, therapy referral'),
        ('PTSD', 'Trauma-focused therapy, prescribed Prazosin for nightmares'),

        # Endocrinology
        ('Hyperthyroidism', 'Prescribed Methimazole 10mg, T3/T4 monitoring'),
        ('Addison\'s Disease', 'Prescribed hydrocortisone replacement, emergency plan'),
        ('Polycystic Ovary Syndrome', 'Prescribed oral contraceptives, metformin, lifestyle modifications'),
        ('Cushing\'s Syndrome', 'Scheduled for dexamethasone suppression test, imaging studies'),

        # Gastroenterology
        ('Gastroesophageal Reflux Disease', 'Prescribed Omeprazole 20mg, dietary modifications'),
        ('Irritable Bowel Syndrome', 'Low FODMAP diet, stress management techniques'),
        ('Ulcerative Colitis', 'Prescribed Mesalamine, scheduled colonoscopy'),
        ('Celiac Disease', 'Gluten-free diet education, nutritionist referral')
    ]

    # Make sure the MedicalRecords table exists before trying to insert data
    cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MedicalRecords'")
    if cursor.fetchone()[0] == 0:
        print("Error: MedicalRecords table does not exist. Please run create_hospital_database() first.")
        cursor.close()
        conn.close()
        return

    # Get actual patient and doctor IDs from the database
    cursor.execute("SELECT patient_id FROM Patients")
    patient_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT doctor_id FROM Doctors")
    doctor_ids = [row[0] for row in cursor.fetchall()]

    # Make sure we have patients and doctors to work with
    if not patient_ids or not doctor_ids:
        print("Error: No patients or doctors found in the database.")
        cursor.close()
        conn.close()
        return

    # Generate 40 medical records (about 2 per patient on average)
    records = []

    # Get today's date
    today = datetime.date.today()

    # Generate records for the past year
    for i in range(40):
        # Use actual patient and doctor IDs from the database
        patient_id = random.choice(patient_ids)
        doctor_id = random.choice(doctor_ids)

        # Random diagnosis and treatment
        diagnosis_index = random.randint(0, len(diagnoses_treatments) - 1)
        diagnosis, treatment = diagnoses_treatments[diagnosis_index]

        # Random date in the past year
        days_ago = random.randint(1, 365)
        record_date = today - datetime.timedelta(days=days_ago)

        # Random notes
        notes_options = [
            "Patient responding well to treatment, continue current regimen.",
            "Follow-up appointment scheduled in 3 months.",
            "Patient reported improvement in symptoms.",
            "Advised patient on lifestyle modifications to support treatment.",
            "Referred to specialist for additional consultation.",
            "Patient education materials provided.",
            "Medication dosage adjusted based on patient response.",
            "Laboratory tests ordered to monitor progress.",
            "Patient advised to return if symptoms worsen.",
            "Discussed potential side effects and management strategies."
        ]
        notes = notes_options[random.randint(0, len(notes_options) - 1)]

        records.append((patient_id, doctor_id, diagnosis, treatment, notes, record_date))

    # Insert medical records
    record_insert_query = """
    INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, treatment, notes, record_date)
    VALUES (?, ?, ?, ?, ?, ?)
    """

    try:
        cursor.executemany(record_insert_query, records)
        conn.commit()
        print(f"{len(records)} medical records inserted successfully!")

        # Print some sample data for verification
        print("\nSample Medical Records:")
        cursor.execute("""
        SELECT TOP 5 p.first_name + ' ' + p.last_name AS patient_name, 
               d.first_name + ' ' + d.last_name AS doctor_name,
               d.specialization,
               m.diagnosis,
               m.record_date
        FROM MedicalRecords m
        JOIN Patients p ON m.patient_id = p.patient_id
        JOIN Doctors d ON m.doctor_id = d.doctor_id
        ORDER BY NEWID()  -- Random order
        """)

        samples = cursor.fetchall()
        for sample in samples:
            print(f"Patient: {sample[0]}, Doctor: {sample[1]} ({sample[2]})")
            print(f"Diagnosis: {sample[3]}, Date: {sample[4]}")
            print("-" * 50)

    except Exception as e:
        print(f"Error inserting medical records: {e}")
        conn.rollback()

    cursor.close()
    conn.close()

    print("Hospital data insertion complete!")


if __name__ == "__main__":
    # First create tables if they don't exist
    create_hospital_database()
    # Then insert data
    insert_hospital_data()