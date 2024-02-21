import {MutableRefObject, useLayoutEffect, useMemo, useState} from 'react'

import useStatefulRef from 'hooks/useStatefulRef'

export default function useHasWrapped<E extends Element = Element>(): [
    MutableRefObject<E>,
    boolean
] {
    const ref = useStatefulRef<E>()
    const [hasWrapped, setHasWrapped] = useState(false)

    const observer = useMemo(
        () =>
            new ResizeObserver((entries) => {
                if (entries[0].target.children) {
                    const length = entries[0].target.children.length
                    const first = entries[0].target.children[0]
                    const last = entries[0].target.children[length - 1]
                    if (
                        first.getBoundingClientRect().top !==
                        last.getBoundingClientRect().top
                    ) {
                        setHasWrapped(true)
                    } else {
                        setHasWrapped(false)
                    }
                }
            }),
        []
    )

    useLayoutEffect(() => {
        if (!ref.current) return
        observer.observe(ref.current)
        return () => {
            observer.disconnect()
        }
        // useStatefulRef triggers rerenders when ref.current changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref.current, observer])

    return [ref, hasWrapped]
}
