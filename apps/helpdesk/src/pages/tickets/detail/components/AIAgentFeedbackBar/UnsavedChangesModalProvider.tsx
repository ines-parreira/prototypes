import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react'

export type UnsavedChangesModalContextValue = {
    closeUnsavedChangesModal: () => void
    openUnsavedChangesModal: () => void
    setHasUnsavedChangesRef: (isDirty: boolean | null) => void
    getHasUnsavedChanges: () => boolean | null
    isOpen: boolean
}

export const UnsavedChangesModalContext = createContext<
    UnsavedChangesModalContextValue | undefined
>(undefined)

export function UnsavedChangesModalProvider({
    children,
}: {
    children: ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const hasUnsavedChanges = useRef<boolean | null>(null)

    const setHasUnsavedChangesRef = useCallback((isDirty: boolean | null) => {
        hasUnsavedChanges.current = isDirty
    }, [])

    const getHasUnsavedChanges = useCallback(() => {
        return hasUnsavedChanges.current
    }, [])

    const openUnsavedChangesModal = useCallback(() => {
        setIsOpen(true)
    }, [])

    const closeUnsavedChangesModal = useCallback(() => {
        setIsOpen(false)
    }, [])

    const value = useMemo(
        () => ({
            openUnsavedChangesModal,
            closeUnsavedChangesModal,
            setHasUnsavedChangesRef,
            getHasUnsavedChanges,
            isOpen,
        }),
        [
            openUnsavedChangesModal,
            setHasUnsavedChangesRef,
            getHasUnsavedChanges,
            closeUnsavedChangesModal,
            isOpen,
        ],
    )

    return (
        <UnsavedChangesModalContext.Provider value={value}>
            {children}
        </UnsavedChangesModalContext.Provider>
    )
}

export function useUnsavedChangesModal() {
    const context = useContext(UnsavedChangesModalContext)
    if (context === undefined) {
        throw new Error(
            'useUnsavedChangesModal must be used within a UnsavedChangesModalProvider',
        )
    }
    return context
}
