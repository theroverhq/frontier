# Private resource downloads

Deployed in Rover AWS account `613025568726`, region `ap-south-1`:

- Bucket: `rover-private-resources-613025568726-ap-south-1`
- Splunk object: `comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf`
- Sentinel object: `comparisons/microsoft-sentinel/Rover-vs-Microsoft-Sentinel-Battlecard.pdf`
- Lambda: `rover-resource-download-signer`
- Role: `rover-resource-download-signer-role`

The bucket blocks all public access, uses bucket-owner-enforced ownership and
AES256 encryption, and denies non-TLS requests. The Lambda role has `s3:GetObject` permission only for the private `comparisons/*` prefix. The function URL requires the
backend's bearer secret; it has no browser CORS configuration. AWS credentials
come from the Lambda execution role, never from frontend code or Google.

Apps Script saves and flushes the lead before calling the signer. The authenticated backend supplies a validated PDF key from the private Resources Sheet; the response is an S3 GET link valid for
300 seconds, with an attachment filename. Lead retries obtain a fresh link.

Upload or replace a PDF using its comparison metadata and the configured Rover AWS CLI profile:

```sh
npm run upload:comparison -- rover-vs-splunk /path/to/Rover-vs-Splunk-Battlecard.pdf
```

For signer code updates, run `python3 integrations/private-downloads/deploy.py --signer-only`.
The deployment script preserves the existing signer secret on redeployment. It writes
Google Script Properties to `/tmp/rover-download-script-properties.json` with
owner-only permissions. Do not commit this file. Run `npm run setup:google-leads`
to generate the private local guide for the Google deployment step. See
[Google setup](../google-leads/README.md#private-pdf-downloads-on-s3).

The account's current Lambda concurrency quota does not permit reserving two
executions; the function uses the account's existing unreserved concurrency.

Verify the live AWS flow without printing secrets or signed links:

```sh
python3 integrations/private-downloads/verify.py /path/to/Rover-vs-Splunk-Battlecard.pdf
```

This checks anonymous S3 access, unauthenticated/wrong-secret signer access,
unknown resources, five-minute expiration configuration, exact PDF bytes,
attachment headers, and rejection of a modified signature.

Local checks:

```sh
npm run test:leads
npm run test:downloads
npm run check
npm run build
```

GitHub Pages remains the website host. Remove the public PDF from the deployed
site by publishing the updated build after updating Google Apps Script.

## Generic signer

The one-time generic deployment (`python3 integrations/private-downloads/deploy.py --signer-only`)
grants read access to `comparisons/*` in the private bucket and accepts a validated
`pdfKey` from the authenticated Google backend. New comparisons then need only a
private PDF upload and a Resources Sheet row; use `npm run upload:comparison`.
The packaged resource manifest serves older ID-only requests during migration.
See [the shared workflow](../../docs/comparisons.md).
