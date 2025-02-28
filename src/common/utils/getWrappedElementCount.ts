const TOLERANCE = 5

type DomTags = keyof HTMLElementTagNameMap

export default function getWrappedElementCount(
    container: HTMLElement | null,
    discardedTag?: DomTags | DomTags[],
): number {
    const children = container?.children
        ? Array.from(container.children).filter((child) => {
              return !discardedTag?.includes(
                  child.tagName.toLowerCase() as DomTags,
              )
          })
        : []

    if (!children.length) {
        return 0
    }
    const firstChildRect = children[0].getBoundingClientRect()
    const lastChildRect = children[children.length - 1].getBoundingClientRect()
    if (Math.abs(lastChildRect.top - firstChildRect.top) > TOLERANCE) {
        let i = 1
        while (
            i < children.length &&
            Math.abs(
                children[i]?.getBoundingClientRect().top - firstChildRect.top,
            ) <= TOLERANCE
        ) {
            i++
        }

        return children.length - i
    }

    return 0
}
