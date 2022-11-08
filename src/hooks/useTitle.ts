import {useEffect, useRef} from 'react'

export function useTitle(title?: string) {
    const originalTitleRef = useRef(document.title)

    useEffect(() => {
        if (!title || document.title === title) {
            return
        }

        document.title = title

        const originalTitle = originalTitleRef.current
        return () => {
            document.title = originalTitle
        }
    }, [title, originalTitleRef])
}

export default useTitle
