export const containsAttachmentURL = (str: string) =>
    str.includes('https://uploads.gorgias.io/') ||
    str.includes('https://uploads.gorgias.xyz/') ||
    str.includes('https://uploads.gorgi.us/') ||
    str.includes('https://attachments.gorgias.help/')
