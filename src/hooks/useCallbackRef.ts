import {useCallback, useState} from 'react'

const useCallbackRef = () => {
    const [element, setElement] = useState<HTMLElement | null>(null)
    const handleElement = useCallback((element: HTMLElement | null) => {
        setElement(element)
    }, [])

    return [element, handleElement] as const
}

export default useCallbackRef
