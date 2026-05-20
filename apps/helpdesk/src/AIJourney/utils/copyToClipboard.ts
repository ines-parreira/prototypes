export const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch {
            // Fall through to execCommand fallback below.
        }
    }
    // Fallback for non-secure contexts (e.g. local dev on custom domains)
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(textarea)
    textarea.select()
    let succeeded = false
    try {
        succeeded = document.execCommand('copy')
    } catch {
        succeeded = false
    }
    document.body.removeChild(textarea)
    return succeeded
}
