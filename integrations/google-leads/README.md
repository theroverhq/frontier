# Google lead capture

One Apps Script web app handles all resource download forms. It saves the lead to
a private Google Sheet, sends an email to the Workspace account that owns the
script, and returns the approved PDF URL only after the Sheet write succeeds.
Visitors do not sign into Google or verify their mailbox.

Every form requires **Name**, **Official Email Address**, **Job Title**,
**Company**, and **Phone Number**. A hidden **pageUrl** field captures the page's
origin and path automatically, excluding query parameters and fragments. The
server checks that the URL belongs to the requested resource page and records it
with the lead.

## Your one-time setup

Run `npm run setup:google-leads` and open the generated local HTML guide. Its
**Copy backend code** button copies the entire prepared script. You can also copy
[Code.gs](Code.gs) directly.

1. Sign into your **Workspace account** at [Google Apps Script](https://script.google.com/home).
   Create a new project named **Rover lead capture**, then replace the contents of
   `Code.gs` with the prepared script.
2. Select **saveLead** in the function dropdown and click **Run**.
   Authorize the requested permissions. This creates the private Sheet with
   **Leads** and **Resources** tabs, configures alerts to your Workspace address,
   and installs the notification retry trigger. The execution log contains the
   Sheet link. Running setup again reuses the same Sheet and preserves its data.
3. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and
   **Who has access: Anyone**. Click **Deploy** and copy the Web app URL ending in
   **/exec**. Send that URL back so it can be connected and tested on the website.

Google requires the account owner to authorize the script; the website does not
need your Google password, OAuth token, or a private API key. Use **Anyone** rather
than **Anyone with Google account**, so visitors do not encounter a sign-in page.
If your Workspace policy removes this option, an administrator must allow public
web app deployments. The `/dev` test URL works only for script editors.
[Google deployment documentation](https://developers.google.com/apps-script/guides/web)

`appsscript.json` is supplied for tooling-based deployments. The editor setup
above only requires pasting `Code.gs`; Apps Script infers the scopes from the code.
The editor hides names ending in `_`, so running `saveLead` without form arguments
calls the private setup helper. This requires the active signed-in account to
match the deploying owner; anonymous visitors and other Workspace users cannot
run setup.

## Updating an existing deployment

For the added Job Title and Company fields, replace the Google project's `Code.gs`
with the updated prepared script and save it. Then choose **Deploy → Manage
deployments**, select the existing web app, click the **pencil icon**, choose
**Version → New version**, and click **Deploy**. Keep the existing `/exec` URL.

You do not need a new Sheet or another setup run. The script automatically appends
the **jobTitle** and **company** columns to the original Leads schema on the first
save or notification retry. It preserves existing headers, lead values, request
IDs, and notification state. Existing leads have blank values for the new fields.
Unrecognized or altered schemas are rejected without overwriting their contents.

The website requires the updated backend's form version 3 before sending any lead,
so an older deployment cannot silently discard the new fields. Publish the new
backend version before publishing the updated website.

## Connecting and verifying the website

Set `leadCaptureEndpoint` in `src/lib/config/lead-capture.ts` to the deployment's
public `/exec` URL. Keep the quotes around it. This URL is public configuration,
not a secret. Then run:

```sh
npm run test:leads
npm run check
npm run build
```

Verify the live website in a signed-out browser: a personal email must be rejected
without a saved lead; a valid company-domain submission must create one row,
notify the owner, and open the PDF. A failed save must keep the visitor on the
form with their entered values. Repeating the same request must not create a
second lead. The localhost preview origin is also supported for this verification.

## Notifications and lead access

The **Leads** tab stores the name, job title, company, email, phone, requested
resource, actual source page URL, timestamp, request ID, and notification state.
Share the Sheet privately with
the teammates who need to manage leads; do not publish it to the web.

Email alerts include the name, job title, company, email, phone, requested guide,
source page, and a link
to the Sheet. By default they go to the script's Workspace owner. To notify more
people, update the `ROVER_NOTIFICATION_EMAILS` Script Property with a comma-separated
list under **Project Settings → Script Properties**. This does not require a new
deployment.

Lead notifications default to CC **suyog@roverhq.ai**. To override this recipient, set the **`ROVER_NOTIFICATION_CC_EMAILS`** Script Property
to their email address. Multiple addresses can be comma-separated. The primary
`ROVER_NOTIFICATION_EMAILS` recipient stays in To. An explicitly blank CC setting
sends no CC; duplicate addresses and addresses already in To are removed. Setup
preserves this property. Deploy the updated `Code.gs` once to enable CC support;
subsequent CC address changes need no redeployment.
[MailApp CC documentation](<https://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(Object)>)

Google counts every To and CC recipient against the sending account's daily
quota, shared with its other scripts.
[Google email quotas](https://developers.google.com/apps-script/guides/services/quotas)

A mail failure preserves the saved lead and its PDF access. The scheduled retry
function checks pending notifications, including when a quota becomes available
again. The notification status and latest error are visible in the Sheet. A
successful send means Google accepted the email; inbox delivery may take longer.

## Private PDF downloads on S3

The comparison battlecards are stored in the private bucket
`rover-private-resources-613025568726-ap-south-1`, at
`comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf` and
`comparisons/microsoft-sentinel/Rover-vs-Microsoft-Sentinel-Battlecard.pdf`. Public access is blocked.
The website contains no PDF. The dedicated Lambda role can read only the private `comparisons/*` prefix.
The Google backend approves each resource through its Resources Sheet row.

After saving a lead, Apps Script calls the Lambda signer with a server-only
shared secret. Lambda returns a five-minute S3 GET link. A retry issues a fresh
link while preserving the existing lead and notification state. The link can
be used by anyone who receives it until it expires; downloaded copies can be shared.

To activate this flow in the existing Google project:

1. Replace `Code.gs` with the updated code in this directory.
2. Open **Project Settings → Script Properties** and add
   `ROVER_DOWNLOAD_SIGNER_URL` and `ROVER_DOWNLOAD_SIGNER_SECRET` from the local
   `/tmp/rover-download-script-properties.json` file. Keep this file private;
   never commit it or put its contents in frontend configuration.
3. If the project specifies OAuth scopes explicitly, add
   `https://www.googleapis.com/auth/script.external_request` (see `appsscript.json`).
   Run `saveLead` without arguments as the owner to authorize the new scope.
4. Choose **Deploy → Manage deployments → Edit → New version → Deploy**.
   Keep the existing `/exec` URL. Deploy the website only after this update.

Existing Resources rows containing the old exact Splunk PDF URL automatically
resolve to the private S3 object. New setup uses an `s3://` object reference.
Neither reference is returned to visitors; only a fresh signed link is returned.
An old backend fails the website's version 3 handshake before sending any lead.

AWS deployment and verification scripts live in `integrations/private-downloads`.
To add another resource, add its Markdown file, upload the PDF using `npm run upload:comparison`, and add the generated Resources Sheet row. Navigation and browser allowlists are generated. No Lambda, IAM, or Google code changes are needed for each comparison.

## Troubleshooting Google account redirects

The bridge uses a credentialless iframe when the browser supports it, isolating
its cookies/storage from the visitor's signed-in Google sessions. This is intended
to prevent Google's account-specific `/macros/u/1/` redirects without requiring
visitors to sign out. Browsers without support retain the ordinary iframe, so
this change does not guarantee multi-account compatibility in every browser.
[Chrome credentialless iframe documentation](https://developer.chrome.com/blog/iframe-credentialless)

Keep the configured endpoint in the canonical `/macros/s/DEPLOYMENT_ID/exec`
format. In Google Apps Script, confirm **Execute as: Me** and **Who has access:
Anyone**. Deploy the updated backend code as a new version under the existing
URL before publishing the website. A successful HTTP response alone is not
sufficient: the client requires the version 3 handshake before sending details.

Validate in a browser with multiple Google accounts signed in: verify the iframe
request avoids `/u/1/`, the handshake succeeds, one lead is saved, the notification
includes CC, and the private PDF downloads. A clean-browser handshake cannot
prove this signed-in scenario works.

## Validation and transport

The browser and server require all five contact fields. The server also requires
the automatically captured page URL and rejects known personal/disposable
email domains and their subdomains. This is a domain filter; it does not prove
mailbox ownership or employment. The domain lists live in `Code.gs` and can be
extended. Backend code changes require **Deploy → Manage deployments → Edit →
New version → Deploy** while keeping the same `/exec` URL.

The website uses a hidden Apps Script HTML bridge and waits for a readable
confirmed-save response. The bridge checks the page origin and a per-form random
channel. The client checks the iframe sender, requires form version 3, and approves only the registered
S3 object URL with a valid five-minute signature structure. It does not treat completion of an opaque `no-cors` request as success.
[Google HTML communication](https://developers.google.com/apps-script/guides/html/communication)

Retries use the same request ID for unchanged form values and source URL; the backend compares
the saved payload and deduplicates under a script lock. Text values are protected
from spreadsheet formula interpretation. `doGet` and `saveLead` are web entrypoints. `checkSentinelResource` is an owner-guarded
editor diagnostic; setup and maintenance helpers end in `_`.

Remove any previously published public PDF from GitHub Pages by deploying the
updated website. If a PDF was committed to a public repository, deletion does
not erase Git history; previously obtained copies cannot be revoked.

## Renamed Splunk page URL

The comparison page now lives at
`https://roverhq.ai/resources/comparisons/splunk/`.
The old website URL redirects to the renamed page and is excluded from the sitemap.

For an existing Google Sheet, open **Resources** and locate the row whose
`resourceId` is `rover-vs-splunk`. Set its **pageUrl** cell to the new URL above.
The deployed backend reads this registry on every submission, so this Sheet
change needs the generic `Code.gs` version deployed once; later Sheet changes require no redeployment. Do this before publishing the
renamed website route; otherwise its submissions fail the page URL check.
Existing leads and the private S3 object do not need to change.

## Microsoft Sentinel comparison

The page is `https://roverhq.ai/resources/comparisons/microsoft-sentinel/`
and uses resource ID `rover-vs-microsoft-sentinel`. Its battlecard is privately
stored in the same S3 bucket and served with a five-minute signed link.

To activate it in the existing Google project:

1. Replace `Code.gs` using the refreshed local setup guide generated by
   `npm run setup:google-leads`.
2. Run **saveLead** from the editor without arguments, as the owner. This adds
   the Sentinel row to **Resources**, preserves existing rows and leads, and
   reuses the current signer settings and notification recipients.
3. Deploy a **New version** of the same web app. Keep the existing `/exec` URL
   and Script Properties. No new AWS secret or Google permission scope is needed.
4. Publish the website after the Google update, then test the Sentinel form.

The same sheet and notifications (including CC to Suyog) serve both comparisons.
The existing Splunk Resources row should use the renamed Splunk page URL above.

## Generic comparisons workflow

Comparison content and PDF filenames now live in Markdown frontmatter. See
[the comparison authoring guide](../../docs/comparisons.md) for adding pages,
private uploads, generated Resources rows, and the one-time backend upgrade.

The runtime registry is the private **Resources** Sheet. New resources do not
need a hardcoded Apps Script allowlist. The two existing resources are retained
as initial setup/migration seeds only. The signer accepts the validated row's
`pdfKey` from this backend; the browser never supplies a storage key.
