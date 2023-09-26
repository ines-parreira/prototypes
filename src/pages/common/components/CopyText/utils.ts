export const selectText = (nodeId: string) => {
    const node = document.getElementById(nodeId)

    if (window.getSelection && node) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(node)
        if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
        }
    } else {
        console.warn('Could not select text in node: Unsupported browser.')
    }
}
