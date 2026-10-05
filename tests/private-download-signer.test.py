import importlib.util
import json
import os
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import Mock, patch

client = Mock()
client.generate_presigned_url.return_value = 'https://private.example/signed'
sys.modules['boto3'] = types.SimpleNamespace(client=Mock(return_value=client))
sys.modules['botocore'] = types.ModuleType('botocore')
sys.modules['botocore.config'] = types.SimpleNamespace(Config=lambda **kw: kw)
spec = importlib.util.spec_from_file_location('signer', Path(__file__).parent.parent / 'integrations/private-downloads/handler.py')
signer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(signer)


class SignerTests(unittest.TestCase):
    def setUp(self):
        client.reset_mock()
        self.environment = patch.dict(os.environ, {'SIGNER_SECRET': 'server-only-secret', 'PDF_BUCKET': 'private-bucket', 'AWS_REGION': 'ap-south-1'})
        self.environment.start()
        self.addCleanup(self.environment.stop)

    def event(self, token='server-only-secret', resource='rover-vs-splunk'):
        return {'requestContext': {'http': {'method': 'POST'}}, 'headers': {'authorization': 'Bearer ' + token}, 'body': json.dumps({'resourceId': resource})}

    def test_unauthorized_requests_never_sign(self):
        for token in ['', 'invalid']:
            self.assertEqual(signer.handler(self.event(token), None)['statusCode'], 403)
        client.generate_presigned_url.assert_not_called()

    def test_only_registered_resource_is_signed_for_five_minutes(self):
        self.assertEqual(signer.handler(self.event(resource='other'), None)['statusCode'], 400)
        client.generate_presigned_url.assert_not_called()
        self.assertEqual(signer.handler(self.event(), None)['statusCode'], 200)
        args, kwargs = client.generate_presigned_url.call_args
        self.assertEqual(args, ('get_object',))
        self.assertEqual(kwargs['ExpiresIn'], 300)
        self.assertEqual(kwargs['Params']['Key'], 'comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf')
        self.assertEqual(kwargs['Params']['Bucket'], 'private-bucket')

    def test_malformed_payloads_and_non_post_requests_do_not_sign(self):
        event = self.event()
        for body in ['not json', '[]', 'null']:
            event['body'] = body
            self.assertEqual(signer.handler(event, None)['statusCode'], 400)
        event['requestContext']['http']['method'] = 'GET'
        self.assertEqual(signer.handler(event, None)['statusCode'], 405)
        client.generate_presigned_url.assert_not_called()


if __name__ == '__main__':
    unittest.main()
