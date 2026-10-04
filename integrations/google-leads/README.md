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

The website requires the updated backend's form version before sending any lead,
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
deployment. Google counts every recipient against the sending account's daily
quota, shared with its other scripts.
[Google email quotas](https://developers.google.com/apps-script/guides/services/quotas)

A mail failure preserves the saved lead and its PDF access. The scheduled retry
function checks pending notifications, including when a quota becomes available
again. The notification status and latest error are visible in the Sheet. A
successful send means Google accepted the email; inbox delivery may take longer.

## Adding more resource pages

1. Add a row to the private **Resources** tab with its `resourceId`, title, PDF URL,
   and page URL. Use approved `https://roverhq.ai` URLs. PDF files live beneath
   `/assets/` and end in `.pdf`. This registry change needs no backend redeployment.
2. Add its exact PDF path to `resourceDownloads` in
   `src/lib/config/lead-capture.ts`, copy the PDF into `static/assets/`, and render
   `<ResourceDownloadForm resourceId="the-resource-id" />` on the page.

The supplied Splunk comparison is already registered as **rover-vs-splunk** and
uses the supplied seven-page comparison guide.

## Validation and transport

The browser and server require all five contact fields. The server also requires
the automatically captured page URL and rejects known personal/disposable
email domains and their subdomains. This is a domain filter; it does not prove
mailbox ownership or employment. The domain lists live in `Code.gs` and can be
extended. Backend code changes require **Deploy → Manage deployments → Edit →
New version → Deploy** while keeping the same `/exec` URL.

The website uses a hidden Apps Script HTML bridge and waits for a readable
confirmed-save response. The bridge checks the page origin and a per-form random
channel. The client checks the iframe sender, requires form version 2, and approves only the registered
PDF URL. It does not treat completion of an opaque `no-cors` request as success.
[Google HTML communication](https://developers.google.com/apps-script/guides/html/communication)

Retries use the same request ID for unchanged form values and source URL; the backend compares
the saved payload and deduplicates under a script lock. Text values are protected
from spreadsheet formula interpretation. Only `doGet` and `saveLead` are public
functions; setup and maintenance helpers end in `_`.

The PDF is a public GitHub Pages asset and can be accessed directly if its URL is
shared. This form collects leads before the normal download flow; it is not
private file storage.
