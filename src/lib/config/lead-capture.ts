// Public Apps Script deployment used by every resource download form.
export const leadCaptureEndpoint =
	'https://script.google.com/macros/s/AKfycbx0ov_JpGknOdlxKeVFQnVo4M2SCPOk5tw2I6SeiFLFw8Poe6r0ZCxO9PKs8wje9Iox/exec';

// Exact private S3 object URLs; the backend adds a short-lived signature.
export const resourceDownloads: Record<string, string> = {
	'rover-vs-splunk':
		'https://rover-private-resources-613025568726-ap-south-1.s3.ap-south-1.amazonaws.com/comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf'
};
