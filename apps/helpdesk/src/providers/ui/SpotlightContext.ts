import type { Dispatch, SetStateAction } from 'react'
import { createContext, useContext } from 'react'

export type SpotlightContextType = {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const SpotlightContext = createContext<SpotlightContextType | undefined>(
    undefined,
)

export const useSpotlightContext = () => {
    const context = useContext(SpotlightContext)
    if (!context) {
        throw new Error(
            'useSpotlightContext must be used within a SpotlightProvider',
        )
    }
    return context
}
