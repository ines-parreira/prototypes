import {MutableRefObject, useLayoutEffect, useMemo, useState} from 'react'

import useStatefulRef from 'hooks/useStatefulRef'

const checkOverflow = (children: HTMLCollection) => {
    const firstRect = children[0].getBoundingClientRect()
    const last = children[children.length - 1]
    if (firstRect.top !== last.getBoundingClientRect().top) {
        let i = 1
        for (i; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect()
            if (firstRect.top !== rect.top) {
                const lastInRowRect = children[i - 1].getBoundingClientRect()
                return {
                    hasWrapped: true,
                    numberOfWrappedElements: children.length - i,
                    width: lastInRowRect.right - firstRect.left,
                }
            }
        }
    }
    return {
        hasWrapped: false,
    }
}

export default function useHasWrapped<E extends Element = Element>(): {
    ref: MutableRefObject<E>
    hasWrapped: boolean
    numberOfWrappedElements?: number
    width?: number
} {
    const ref = useStatefulRef<E>()
    useState<number>()
    const [state, setState] = useState<{
        hasWrapped: boolean
        numberOfWrappedElements: number | undefined
        width: number | undefined
    }>({
        hasWrapped: false,
        numberOfWrappedElements: undefined,
        width: undefined,
    })

    const resizeObserver = useMemo(
        () =>
            new ResizeObserver((entries) => {
                if (entries[0].target.children) {
                    const {hasWrapped, numberOfWrappedElements, width} =
                        checkOverflow(entries[0].target.children)
                    setState({
                        hasWrapped,
                        numberOfWrappedElements,
                        width,
                    })
                }
            }),
        []
    )

    const mutationObserver = useMemo(
        () =>
            new MutationObserver(() => {
                const {hasWrapped, numberOfWrappedElements, width} =
                    checkOverflow(ref.current.children)
                setState({
                    hasWrapped,
                    numberOfWrappedElements,
                    width,
                })
            }),
        [ref]
    )

    useLayoutEffect(() => {
        if (!ref.current) return
        resizeObserver.observe(ref.current)
        mutationObserver.observe(ref.current, {
            childList: true,
            subtree: true,
        })
        return () => {
            resizeObserver.disconnect()
            mutationObserver.disconnect()
        }
        // useStatefulRef triggers rerenders when ref.current changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref.current, resizeObserver])

    return {ref, ...state}
}
