import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'

import type { Drag, Sizes } from '../types'

export function useDrag(sizes: Sizes) {
    const [drag, setDrag] = useState<Drag | null>(null)

    useEffect(() => {
        if (!drag) return

        function handleMouseUp() {
            setDrag(null)
        }

        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [drag])

    const createResizer = useCallback(
        (handle: number) => (e: MouseEvent) => {
            e.preventDefault()
            setDrag({ handle, position: { x: e.clientX, y: e.clientY }, sizes })
        },
        [sizes],
    )

    return useMemo(() => ({ createResizer, drag }), [createResizer, drag])
}
