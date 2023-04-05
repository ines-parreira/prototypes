import {useCallback, useRef, useState} from 'react'

export default function useMacros() {
    const [isActive, setIsActive] = useState(false)
    const hasShown = useRef<boolean>(false)

    if (isActive && !hasShown.current) {
        hasShown.current = true
    }

    const handleChangeActive = useCallback((isActive?: boolean) => {
        setIsActive((s) => (typeof isActive === 'boolean' ? isActive : !s))
    }, [])

    return {
        isActive,
        hasShown: hasShown.current,
        onChangeActive: handleChangeActive,
    }
}
