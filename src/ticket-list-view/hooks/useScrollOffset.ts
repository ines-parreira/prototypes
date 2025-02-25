import { useEffect, useState } from 'react'

export default function useScrollOffset(element: HTMLElement | null) {
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        if (!element) return

        function handleScroll() {
            setOffset(element!.scrollTop)
        }

        element.addEventListener('scroll', handleScroll)

        return () => {
            element.removeEventListener('scroll', handleScroll)
        }
    }, [element])

    return [offset]
}
