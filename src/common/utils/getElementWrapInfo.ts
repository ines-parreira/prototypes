export default function getElementWrapInfo(children: HTMLCollection) {
    const firstRect = children[0].getBoundingClientRect()
    const last = children[children.length - 1]
    if (firstRect.top !== last.getBoundingClientRect().top) {
        let lastInRowRect = firstRect
        for (let i = 1; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect()
            if (firstRect.top !== rect.top) {
                return {
                    wrappedElementCount: children.length - i,
                    width: lastInRowRect.right - firstRect.left,
                }
            }
            lastInRowRect = rect
        }
    }
}
