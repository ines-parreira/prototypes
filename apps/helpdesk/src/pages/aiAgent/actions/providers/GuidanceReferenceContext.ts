import { createContext, useContext } from 'react'

export type GuidanceReferenceContextType = {
    canBeDeleted: (actionId: string) => boolean
    references: Record<
        string,
        { id: number; title: string; sourceId: string }[]
    >
}

const GuidanceReferenceContext = createContext<GuidanceReferenceContextType>({
    canBeDeleted: () => false,
    references: {},
})

export const useGuidanceReferenceContext = () =>
    useContext(GuidanceReferenceContext)

export default GuidanceReferenceContext
