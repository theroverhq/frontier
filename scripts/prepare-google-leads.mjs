import { chmod, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const code = await readFile(path.join(projectRoot, 'integrations/google-leads/Code.gs'), 'utf8');
const serializedCode = JSON.stringify(code).replaceAll('<', '\\u003c');
let privateProperties = {};
try {
	privateProperties = JSON.parse(
		await readFile(path.join(tmpdir(), 'rover-download-script-properties.json'), 'utf8')
	);
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}
const serializedProperties = JSON.stringify(privateProperties).replaceAll('<', '\\u003c');
const outputPath = path.join(tmpdir(), 'rover-google-leads-setup.html');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Connect Rover lead capture</title>
  <style>
    :root { color-scheme: dark; font: 16px/1.6 system-ui, sans-serif; }
    body { max-width: 760px; margin: 0 auto; padding: 40px 24px; background: #111410; color: #e5e9e1; }
    h1 { line-height: 1.2; font-size: 2rem; } h2 { font-size: 1.2rem; margin-top: 32px; }
    p, li { color: #c1c8b9; } li { margin-bottom: 12px; }
    a { color: #b6f272; } button { cursor: pointer; font: inherit; border: 0; border-radius: 8px; padding: 12px 20px; background: #b6f272; color: #15200b; font-weight: 650; }
    button:focus-visible, a:focus-visible, textarea:focus-visible { outline: 3px solid #b6f272; outline-offset: 4px; }
    code { color: #e5e9e1; } textarea { box-sizing: border-box; width: 100%; min-height: 240px; background: #191e16; color: #e5e9e1; border: 1px solid #435239; border-radius: 8px; padding: 16px; font: 12px/1.5 monospace; }
    #copy-status { display: inline-block; margin-left: 12px; } details { margin-top: 20px; } summary { cursor: pointer; }
  </style>
</head>
<body>
  <p>Rover website setup</p>
  <h1>Connect your Workspace account</h1>
  <p>The backend is ready. It requires Name, Official Email Address, Job Title, Company, and Phone Number, and saves the page URL automatically. These steps create your private lead Sheet, turn on email alerts to your Workspace address, and deploy one endpoint for all resource pages.</p>
  <h2>1. Create the script</h2>
  <p><a href="https://script.google.com/home" target="_blank" rel="noopener noreferrer">Open Google Apps Script</a> while signed into Workspace. Select <strong>New project</strong> and name it <strong>Rover lead capture</strong>. Replace the editor's <code>Code.gs</code> with the code below.</p>
  <button id="copy-code" type="button">Copy backend code</button><span id="copy-status" role="status" aria-live="polite"></span>
  <details><summary>Show the complete backend code</summary><textarea id="backend-code" aria-label="Backend code to paste into Google Apps Script" readonly spellcheck="false"></textarea></details>
  <h2>Already set up? Update your existing script</h2>
  <ol>
    <li>Copy the updated backend code above. Replace <code>Code.gs</code> in your existing Google Apps Script project, then save.</li>
    <li>Choose <strong>Deploy → Manage deployments</strong>. Select your existing web app, click the <strong>pencil icon</strong>, choose <strong>Version → New version</strong>, and click <strong>Deploy</strong>.</li>
  </ol>
  <p>Keep the same Web app URL. The script adds Job Title and Company columns automatically and preserves existing leads. For the generic comparison upgrade, run <code>saveLead</code> once from the editor without arguments and check the Resources rows against <code>integrations/google-leads/Resources.csv</code>. Future comparisons need only a new Resources row, not another script deployment. Existing leads, rows, and private settings are preserved. Publish the backend update before the website update.</p>
  <h2>Private S3 download settings</h2>
  <p>In <strong>Project Settings → Script Properties</strong>, add these two properties. Keep this local guide private because it contains the signer secret.</p>
  <textarea id="private-properties" aria-label="Private script properties" readonly spellcheck="false"></textarea>
  <p>If OAuth scopes are set explicitly in <code>appsscript.json</code>, add <code>https://www.googleapis.com/auth/script.external_request</code>. Run <code>saveLead</code> without arguments as the owner to authorize the new scope, then deploy a new version using the same web app URL. Deploy the website after the backend update.</p>
  <h2>Notification CC</h2>
  <p>Lead notifications now CC <strong>suyog@roverhq.ai</strong> by default. To override this inbox, add <code>ROVER_NOTIFICATION_CC_EMAILS</code> in Script Properties with its email address. The primary recipient remains in To. Deploy the updated code once to enable CC; later address changes need no redeployment.</p>
  <h2>2. Run the one-time setup</h2>
  <p>In the editor's function dropdown, select <code>saveLead</code>, click <strong>Run</strong>, and authorize the requested permissions. Running this from the editor without form data creates the private Sheet and notification retry trigger, only for the signed-in script owner. The execution log shows the Sheet link. You can run setup again without losing data.</p>
  <h2>3. Deploy and share the URL</h2>
  <ol>
    <li>Select <strong>Deploy → New deployment</strong>, then choose <strong>Web app</strong> using the deployment type selector.</li>
    <li>Set <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>.</li>
    <li>Click <strong>Deploy</strong>. Copy the Web app URL ending in <code>/exec</code> and paste it into the Codex chat.</li>
  </ol>
  <p>Codex can then connect the endpoint and verify the form. Keep the Sheet private; visitors only interact with the script. No Google password or private API key needs to be shared.</p>
  <script>
    const backendCode = ${serializedCode};
    document.getElementById('private-properties').value = JSON.stringify(${serializedProperties}, null, 2);
    const textArea = document.getElementById('backend-code');
    textArea.value = backendCode;
    document.getElementById('copy-code').addEventListener('click', async () => {
      const status = document.getElementById('copy-status');
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(backendCode);
        } else {
          document.querySelector('details').open = true;
          textArea.focus();
          textArea.select();
          if (!document.execCommand('copy')) throw new Error('manual-copy');
        }
        status.textContent = 'Copied — paste into Code.gs.';
      } catch {
        document.querySelector('details').open = true;
        textArea.focus();
        textArea.select();
        status.textContent = 'Code selected — press Ctrl+C or Cmd+C.';
      }
    });
  </script>
</body>
</html>`;

await writeFile(outputPath, html, { mode: 0o600 });
await chmod(outputPath, 0o600);
console.log(`Open this local setup guide in your browser: ${outputPath}`);
