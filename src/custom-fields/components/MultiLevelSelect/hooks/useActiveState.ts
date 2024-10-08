import {useState, useCallback} from 'react'

export function useActiveState(setSearch: (nextSearch: string) => void) {
    const [isActive, setActive] = useState(false)
    const setActiveWithSideEffect = useCallback(
        (nextIsActive: boolean) => {
            if (!nextIsActive) {
                setSearch('')
            }
            setActive(nextIsActive)
        },
        [setSearch]
    )
    return [isActive, setActiveWithSideEffect] as const
}
