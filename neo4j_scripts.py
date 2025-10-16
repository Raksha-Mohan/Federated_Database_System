from database import Neo4jConnection


def create_insurance_database():
    neo4j_conn = Neo4jConnection()

    # Create constraints for unique IDs
    neo4j_conn.query("CREATE CONSTRAINT policy_id IF NOT EXISTS FOR (p:InsurancePolicy) REQUIRE p.policy_id IS UNIQUE")
    neo4j_conn.query("CREATE CONSTRAINT claim_id IF NOT EXISTS FOR (c:Claim) REQUIRE c.claim_id IS UNIQUE")

    # Clear existing data to avoid conflicts
    neo4j_conn.query("MATCH (c:Claim) DETACH DELETE c")
    neo4j_conn.query("MATCH (p:InsurancePolicy) DELETE p")

    # Create sample insurance policies with flattened properties instead of nested maps
    neo4j_conn.query("""
    MERGE (p1:InsurancePolicy {
        policy_id: 'POL001',
        patient_id: 1041,
        provider: 'BlueCross',
        policy_number: 'BC12345',
        coverage_type: 'Family',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        deductible: 500,
        copay: 20,
        max_out_of_pocket: 5000,
        coverage_percentage: 80
    })

    MERGE (p2:InsurancePolicy {
        policy_id: 'POL002',
        patient_id: 1042,
        provider: 'Aetna',
        policy_number: 'AE67890',
        coverage_type: 'Individual',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        deductible: 1000,
        copay: 30,
        max_out_of_pocket: 6000,
        coverage_percentage: 70
    })

    MERGE (p3:InsurancePolicy {
        policy_id: 'POL003',
        patient_id: 1043,
        provider: 'UnitedHealth',
        policy_number: 'UH54321',
        coverage_type: 'Individual',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        deductible: 750,
        copay: 25,
        max_out_of_pocket: 5500,
        coverage_percentage: 75
    })
    """)

    # Create sample claims with proper WITH clauses between MERGE and MATCH
    neo4j_conn.query("""
    MERGE (c1:Claim {
        claim_id: 'CLM001',
        policy_id: 'POL001',
        record_id: 1,
        claim_date: '2023-01-15',
        amount: 150.00,
        status: 'Approved',
        description: 'Office visit and prescription'
    })
    WITH c1
    MATCH (p:InsurancePolicy {policy_id: 'POL001'})
    MERGE (c1)-[:FILED_UNDER]->(p)
    """)

    neo4j_conn.query("""
    MERGE (c2:Claim {
        claim_id: 'CLM002',
        policy_id: 'POL001',
        record_id: 2,
        claim_date: '2023-03-20',
        amount: 75.00,
        status: 'Approved',
        description: 'Follow-up visit'
    })
    WITH c2
    MATCH (p:InsurancePolicy {policy_id: 'POL001'})
    MERGE (c2)-[:FILED_UNDER]->(p)
    """)

    neo4j_conn.query("""
    MERGE (c3:Claim {
        claim_id: 'CLM003',
        policy_id: 'POL002',
        record_id: 3,
        claim_date: '2023-02-25',
        amount: 350.00,
        status: 'Processing',
        description: 'X-ray and orthopedic consult'
    })
    WITH c3
    MATCH (p:InsurancePolicy {policy_id: 'POL002'})
    MERGE (c3)-[:FILED_UNDER]->(p)
    """)

    neo4j_conn.query("""
    MERGE (c4:Claim {
        claim_id: 'CLM004',
        policy_id: 'POL003',
        record_id: 4,
        claim_date: '2023-04-10',
        amount: 560.00,
        status: 'Pending',
        description: 'Cardiology tests and consultation'
    })
    WITH c4
    MATCH (p:InsurancePolicy {policy_id: 'POL003'})
    MERGE (c4)-[:FILED_UNDER]->(p)
    """)

    neo4j_conn.close()
    print("Insurance database created successfully with sample data!")


if __name__ == "__main__":
    create_insurance_database()