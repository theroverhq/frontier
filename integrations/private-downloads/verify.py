"""Verify anonymous denial and authenticated download without printing secrets/links."""
import hashlib
import json
from pathlib import Path
import sys
import urllib.error
import urllib.parse
import urllib.request

properties = json.loads(Path('/tmp/rover-download-script-properties.json').read_text())
endpoint = properties['ROVER_DOWNLOAD_SIGNER_URL']
resource_id = sys.argv[2] if len(sys.argv) > 2 else 'rover-vs-splunk'
key = json.loads(Path(__file__).with_name('resources.json').read_text())[resource_id]
object_url = 'https://rover-private-resources-613025568726-ap-south-1.s3.ap-south-1.amazonaws.com/' + key


def request(url, payload=None, token=None):
    headers = {}
    if payload is not None:
        headers['Content-Type'] = 'application/json'
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(url, data=json.dumps(payload).encode() if payload is not None else None, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as result:
            return result.status, result.read(), result.headers
    except urllib.error.HTTPError as error:
        return error.code, error.read(), error.headers


assert request(object_url)[0] == 403, 'Anonymous S3 download must be denied'
assert request(endpoint, {'resourceId': resource_id, 'pdfKey': key})[0] == 403, 'Signer must require the backend secret'
assert request(endpoint, {'resourceId': resource_id, 'pdfKey': key}, 'invalid-secret')[0] == 403
assert request(endpoint, {'resourceId': 'unknown'}, properties['ROVER_DOWNLOAD_SIGNER_SECRET'])[0] == 400
assert request(endpoint, {'resourceId': resource_id}, properties['ROVER_DOWNLOAD_SIGNER_SECRET'])[0] == 200, 'Legacy requests must keep working'
status, body, _ = request(endpoint, {'resourceId': resource_id, 'pdfKey': key}, properties['ROVER_DOWNLOAD_SIGNER_SECRET'])
assert status == 200, f'Authenticated signer status: {status}'
url = json.loads(body)['downloadUrl']
parts = urllib.parse.urlsplit(url)
assert url.startswith(object_url + '?')
assert urllib.parse.parse_qs(parts.query)['X-Amz-Expires'] == ['300']
status, pdf, headers = request(url)
assert status == 200, f'Signed download status: {status}'
assert hashlib.sha256(pdf).digest() == hashlib.sha256(Path(sys.argv[1]).read_bytes()).digest(), 'Downloaded PDF must exactly match battlecard'
assert 'attachment' in headers['Content-Disposition']
assert request(url.replace('X-Amz-Expires=300', 'X-Amz-Expires=301'))[0] == 403, 'Tampered signatures must be denied'
print('Verified: anonymous S3/signing requests denied; authorized five-minute link downloads the exact battlecard; altered signature denied.')
