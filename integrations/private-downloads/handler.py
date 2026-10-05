"""Private S3 signer called only by the lead-capture backend."""
import base64
import hmac
import json
import os
import re
from pathlib import Path

import boto3
from botocore.config import Config

# Legacy ID-only requests remain supported while Google is upgraded.
RESOURCE_KEYS = json.loads(Path(__file__).with_name('resources.json').read_text())
KEY_PATTERN = re.compile(r'comparisons/[a-z0-9]+(?:-[a-z0-9]+)*/[A-Za-z0-9_-]+\.pdf\Z')


def response(status, body):
    return {'statusCode': status, 'headers': {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}, 'body': json.dumps(body)}


def handler(event, context):
    if event.get('requestContext', {}).get('http', {}).get('method') != 'POST':
        return response(405, {'error': 'Method not allowed'})
    headers = {key.lower(): value for key, value in event.get('headers', {}).items()}
    secret = os.environ.get('SIGNER_SECRET', '')
    if not secret or not hmac.compare_digest(headers.get('authorization', ''), 'Bearer ' + secret):
        return response(403, {'error': 'Forbidden'})
    try:
        body = event.get('body', '')
        if event.get('isBase64Encoded'):
            body = base64.b64decode(body).decode('utf-8')
        payload = json.loads(body)
        resource_id = payload.get('resourceId')
        if not isinstance(resource_id, str) or not re.fullmatch(r'rover-vs-[a-z0-9]+(?:-[a-z0-9]+)*', resource_id):
            return response(400, {'error': 'Unknown resource'})
        key = payload.get('pdfKey') if 'pdfKey' in payload else RESOURCE_KEYS.get(resource_id)
        if not isinstance(key, str) or not KEY_PATTERN.fullmatch(key):
            return response(400, {'error': 'Unknown resource'})
    except (ValueError, TypeError, AttributeError):
        return response(400, {'error': 'Invalid request'})
    client = boto3.client('s3', region_name=os.environ['AWS_REGION'], config=Config(signature_version='s3v4', s3={'addressing_style': 'virtual'}))
    url = client.generate_presigned_url('get_object', Params={
        'Bucket': os.environ['PDF_BUCKET'], 'Key': key,
        'ResponseContentDisposition': 'attachment; filename="' + key.rsplit('/', 1)[-1] + '"',
        'ResponseContentType': 'application/pdf',
    }, ExpiresIn=300)
    return response(200, {'downloadUrl': url})
