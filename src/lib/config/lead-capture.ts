// Public Apps Script deployment used by every resource download form.
export const leadCaptureEndpoint =
	'https://script.google.com/macros/s/AKfycbx0ov_JpGknOdlxKeVFQnVo4M2SCPOk5tw2I6SeiFLFw8Poe6r0ZCxO9PKs8wje9Iox/exec';

// Match the approved PDF paths in the backend's private Resources sheet.
export const resourceDownloads: Record<string, string> = {
	'rover-vs-splunk': '/assets/comparisons/splunk/rover-vs-splunk-full-comparison-guide.pdf'
};
