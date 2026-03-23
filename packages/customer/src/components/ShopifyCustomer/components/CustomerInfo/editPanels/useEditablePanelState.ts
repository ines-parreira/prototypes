import { useEffect, useMemo, useRef, useState } from 'react'

export function useEditablePanelState<T>({
    init,
    isEqual,
    isOpen,
}: {
    init: () => T
    isEqual: (a: T, b: T) => boolean
    isOpen: boolean
}) {
    const [localSections, setLocalSections] = useState(init)
    const initialSectionsRef = useRef(localSections)
    const isSavingRef = useRef(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen && !isSavingRef.current) {
            const sections = init()
            setLocalSections(sections)
            initialSectionsRef.current = sections
        }
    }, [isOpen, init])

    const hasChanges = useMemo(
        () => !isEqual(localSections, initialSectionsRef.current),
        [localSections, isEqual],
    )

    return {
        localSections,
        setLocalSections,
        isSaving,
        setIsSaving,
        isSavingRef,
        hasChanges,
    }
}
