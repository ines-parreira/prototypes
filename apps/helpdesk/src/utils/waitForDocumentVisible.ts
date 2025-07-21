/**
 * Wait for the document to be visible.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 * @returns A promise that is resolved once `document.hidden` is false.
 */
export function waitForDocumentVisible(): Promise<void> {
    if (!document.hidden) {
        return Promise.resolve()
    }

    return new Promise((resolve) => {
        const eventHandler = () => {
            if (!document.hidden) {
                document.removeEventListener('visibilitychange', eventHandler)
                resolve()
            }
        }

        document.addEventListener('visibilitychange', eventHandler)
    })
}
