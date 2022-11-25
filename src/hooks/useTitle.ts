import {useEffect} from 'react'

const originalTitle = (document && document.title) || 'Gorgias'

export function useTitle(title?: string) {
    useEffect(() => {
        if (!title || document.title === title) {
            return
        }

        document.title = title

        return () => {
            document.title = originalTitle
        }
    }, [title])
}

export default useTitle
