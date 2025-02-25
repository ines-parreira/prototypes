export default function getElementWrapInfo(
    children: HTMLCollection,
    totalWidth: number,
) {
    const firstRect = children[0].getBoundingClientRect()
    const last = children[children.length - 1]

    const tagsChildren = Array.from(children).filter(
        (child) => child.tagName === 'DIV',
    )
    const sortedElements = tagsChildren.sort((a, b) => {
        const first = (a.textContent as string).toLowerCase()
        const second = (b.textContent as string).toLowerCase()

        return first > second ? 1 : second > first ? -1 : 0
    })

    let filledWidth = 0
    if (firstRect.top !== last.getBoundingClientRect().top) {
        let i = 0
        while (filledWidth < totalWidth && i < sortedElements.length) {
            const rect = sortedElements[i].getBoundingClientRect()
            filledWidth += rect.width + 4
            if (filledWidth <= totalWidth) {
                i++
            }
        }

        return sortedElements.length - i
    }

    return 0
}
