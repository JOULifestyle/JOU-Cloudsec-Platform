import subprocess
import json

def get_steampipe_results():
    """
    Run a Steampipe query and return the results as Python objects.
    Adjust the query below to your needs.
    """

    # Your Steampipe query here — example: list all AWS IAM users
    query = 'select * from aws_iam_user limit 10;'

    try:
        # Run steampipe with --json output option
        completed_process = subprocess.run(
            ['steampipe', 'query', '--json', query],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Parse JSON output
        result_json = completed_process.stdout
        results = json.loads(result_json)
        return results

    except subprocess.CalledProcessError as e:
        # Log or handle errors here
        print(f"Steampipe query failed: {e.stderr}")
        return {"error": "Failed to run Steampipe query"}

    except json.JSONDecodeError:
        print("Failed to parse Steampipe JSON output")
        return {"error": "Failed to parse Steampipe output"}
