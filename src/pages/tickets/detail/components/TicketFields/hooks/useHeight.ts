import {
    RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useCallback,
    useState,
} from 'react'

const MIN_HEIGHT = 24
export const MAX_HEIGHT = 500

const useHeight = (
    ref: RefObject<HTMLElement>,
    amountOfTicketFieldsToRender: number,
    isExpanded: boolean
) => {
    const [maxHeight, setMaxHeight] = useState<number>()
    const [last, setLast] = useState<DOMRect>()

    const recalculateMaxHeight = useCallback(
        (expanded: boolean): number | undefined => {
            if (!ref.current) return

            const scrollHeight = ref.current?.scrollHeight
            const isRequiredHeightHigherThanMaximumHeight =
                !!scrollHeight && scrollHeight > MAX_HEIGHT

            return !expanded
                ? MIN_HEIGHT
                : isRequiredHeightHigherThanMaximumHeight
                  ? MAX_HEIGHT
                  : scrollHeight
        },
        [ref]
    )

    useEffect(() => {
        setMaxHeight(recalculateMaxHeight(isExpanded))
    }, [ref, recalculateMaxHeight, amountOfTicketFieldsToRender, isExpanded])

    const observer = useMemo(
        () =>
            new ResizeObserver(() => {
                const boundingRect = ref.current?.getBoundingClientRect()
                const lastWidth = last?.width
                const lastHeight = last?.height

                if (
                    lastWidth !== boundingRect?.width &&
                    lastHeight === boundingRect?.height
                ) {
                    setMaxHeight(recalculateMaxHeight(isExpanded))
                }

                setLast(boundingRect)
            }),
        [recalculateMaxHeight, last?.height, last?.width, isExpanded, ref]
    )

    useLayoutEffect(() => {
        if (!ref.current) return
        setLast(ref.current.getBoundingClientRect())
        observer.observe(ref.current)

        return () => {
            observer.disconnect()
        }
    }, [observer, ref])

    return maxHeight
}

export default useHeight
