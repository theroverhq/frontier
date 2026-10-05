"""Deploy a dedicated private bucket and signer with the configured AWS CLI profile.
Usage: python3 integrations/private-downloads/deploy.py /path/to/Battlecard.pdf
Secrets are written only to a permission-restricted file under /tmp.
"""
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys
import tempfile
import time
import zipfile

REGION = 'ap-south-1'
FUNCTION = 'rover-resource-download-signer'
ROLE = FUNCTION + '-role'
KEY = 'comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf'


def aws(*args, optional=False):
    process = subprocess.run(['aws', '--region', REGION, *args, '--output', 'json'], capture_output=True, text=True)
    if process.returncode:
        if optional and any(code in process.stderr for code in ['NoSuchEntity', 'ResourceNotFoundException', 'NoSuchBucket']):
            return None
        raise RuntimeError(process.stderr)
    return json.loads(process.stdout) if process.stdout.strip() else {}


account = aws('sts', 'get-caller-identity')['Account']
if account != '613025568726':
    raise ValueError('Use the Rover AWS account 613025568726; application allowlists target this account.')
bucket = 'rover-private-resources-' + account + '-' + REGION
pdf = Path(sys.argv[1]).resolve()
if not pdf.read_bytes().startswith(b'%PDF-'):
    raise ValueError('Input must be a PDF')
with tempfile.TemporaryDirectory(prefix='rover-s3-') as directory:
    work = Path(directory)
    def config(name, value):
        path = work / name
        path.write_text(json.dumps(value))
        path.chmod(0o600)
        return 'file://' + str(path)
    # Bucket creation fails closed rather than silently using a bucket from another account.
    exists = subprocess.run(['aws', '--region', REGION, 's3api', 'head-bucket', '--bucket', bucket, '--expected-bucket-owner', account], capture_output=True).returncode == 0
    if not exists:
        aws('s3api', 'create-bucket', '--bucket', bucket, '--create-bucket-configuration', 'LocationConstraint=' + REGION, '--object-ownership', 'BucketOwnerEnforced')
    aws('s3api', 'put-public-access-block', '--bucket', bucket, '--public-access-block-configuration', 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true')
    aws('s3api', 'put-bucket-encryption', '--bucket', bucket, '--server-side-encryption-configuration', config('encryption.json', {'Rules': [{'ApplyServerSideEncryptionByDefault': {'SSEAlgorithm': 'AES256'}}]}))
    aws('s3api', 'put-bucket-policy', '--bucket', bucket, '--policy', config('bucket-policy.json', {'Version': '2012-10-17', 'Statement': [{'Sid': 'RequireTLS', 'Effect': 'Deny', 'Principal': '*', 'Action': 's3:*', 'Resource': ['arn:aws:s3:::' + bucket, 'arn:aws:s3:::' + bucket + '/*'], 'Condition': {'Bool': {'aws:SecureTransport': 'false'}}}]}))
    aws('s3api', 'put-object', '--bucket', bucket, '--key', KEY, '--body', str(pdf), '--content-type', 'application/pdf', '--content-disposition', 'attachment; filename="Rover-vs-Splunk-Battlecard.pdf"', '--cache-control', 'private, no-store', '--server-side-encryption', 'AES256')
    role = aws('iam', 'get-role', '--role-name', ROLE, optional=True)
    if role is None:
        role = aws('iam', 'create-role', '--role-name', ROLE, '--assume-role-policy-document', config('trust.json', {'Version': '2012-10-17', 'Statement': [{'Effect': 'Allow', 'Principal': {'Service': 'lambda.amazonaws.com'}, 'Action': 'sts:AssumeRole'}]}))
    aws('iam', 'put-role-policy', '--role-name', ROLE, '--policy-name', 'ReadBattlecard', '--policy-document', config('read.json', {'Version': '2012-10-17', 'Statement': [{'Effect': 'Allow', 'Action': 's3:GetObject', 'Resource': 'arn:aws:s3:::' + bucket + '/' + KEY}]}))
    archive = work / 'handler.zip'
    with zipfile.ZipFile(archive, 'w') as output:
        output.write(Path(__file__).with_name('handler.py'), 'handler.py')
    existing = aws('lambda', 'get-function', '--function-name', FUNCTION, optional=True)
    secret = (existing or {}).get('Configuration', {}).get('Environment', {}).get('Variables', {}).get('SIGNER_SECRET') or secrets.token_urlsafe(48)
    environment = config('env.json', {'Variables': {'PDF_BUCKET': bucket, 'SIGNER_SECRET': secret}})
    if existing:
        aws('lambda', 'update-function-code', '--function-name', FUNCTION, '--zip-file', 'fileb://' + str(archive))
        aws('lambda', 'wait', 'function-updated', '--function-name', FUNCTION)
        aws('lambda', 'update-function-configuration', '--function-name', FUNCTION, '--environment', environment)
        aws('lambda', 'wait', 'function-updated', '--function-name', FUNCTION)
    else:
        for attempt in range(12):
            try:
                aws('lambda', 'create-function', '--function-name', FUNCTION, '--runtime', 'python3.13', '--handler', 'handler.handler', '--role', role['Role']['Arn'], '--zip-file', 'fileb://' + str(archive), '--timeout', '10', '--memory-size', '128', '--environment', environment)
                break
            except RuntimeError as error:
                if 'cannot be assumed' not in str(error) or attempt == 11:
                    raise
                time.sleep(5)
    aws('lambda', 'wait', 'function-active-v2', '--function-name', FUNCTION)
    try:
        aws('lambda', 'put-function-concurrency', '--function-name', FUNCTION, '--reserved-concurrent-executions', '2')
    except RuntimeError as error:
        if 'UnreservedConcurrentExecution' not in str(error):
            raise
        print('Account concurrency quota does not permit a reservation; using the account limit.', file=sys.stderr)
    url = aws('lambda', 'get-function-url-config', '--function-name', FUNCTION, optional=True)
    if url is None:
        url = aws('lambda', 'create-function-url-config', '--function-name', FUNCTION, '--auth-type', 'NONE')
    policy = aws('lambda', 'get-policy', '--function-name', FUNCTION, optional=True)
    statements = {item['Sid'] for item in json.loads(policy['Policy'])['Statement']} if policy else set()
    for sid, action, extra in [('AllowFunctionUrl', 'lambda:InvokeFunctionUrl', ['--function-url-auth-type', 'NONE']), ('AllowInvokeViaUrl', 'lambda:InvokeFunction', ['--invoked-via-function-url'])]:
        if sid not in statements:
            aws('lambda', 'add-permission', '--function-name', FUNCTION, '--statement-id', sid, '--action', action, '--principal', '*', *extra)
    descriptor = os.open('/tmp/rover-download-script-properties.json', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    os.fchmod(descriptor, 0o600)
    with os.fdopen(descriptor, 'w') as output:
        json.dump({'ROVER_DOWNLOAD_SIGNER_URL': url['FunctionUrl'], 'ROVER_DOWNLOAD_SIGNER_SECRET': secret}, output, indent=2)
    print(json.dumps({'bucket': bucket, 'region': REGION, 'objectKey': KEY, 'signerUrl': url['FunctionUrl'], 'scriptPropertiesFile': '/tmp/rover-download-script-properties.json'}, indent=2))
