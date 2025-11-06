export const shouldAutoFetchMoreItems = (
    container: HTMLElement | null,
    threshold: number,
): boolean => {
    if (!container) return false

    const scroller = container.querySelector(
        '[data-virtuoso-scroller]',
    ) as HTMLElement
    if (!scroller) return false

    const scrollableDistance = scroller.scrollHeight - scroller.clientHeight
    const hasEnoughScrollDistance = scrollableDistance >= threshold

    return !hasEnoughScrollDistance
}

export const checkAndTriggerAutoFetch = (
    container: HTMLElement | null,
    threshold: number,
    hasNextPage: boolean,
    isFetchingNextPage: boolean,
    onEndReached?: () => void,
): void => {
    const shouldFetch = shouldAutoFetchMoreItems(container, threshold)

    if (shouldFetch && hasNextPage && !isFetchingNextPage && onEndReached) {
        onEndReached()
    }
}
