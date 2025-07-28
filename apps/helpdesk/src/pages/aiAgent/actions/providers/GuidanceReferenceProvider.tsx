import { ReactNode, useCallback } from 'react'

import { FindAllGuidancesKnowledgeResourcesResult } from '@gorgias/knowledge-service-client'

import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'

import GuidanceReferenceContext, {
    GuidanceReferenceContextType,
} from './GuidanceReferenceContext'

type Props<T extends { id: string }> = {
    actions: Array<T>
    children: ReactNode
}

export const select = (data?: FindAllGuidancesKnowledgeResourcesResult) => {
    return data?.data?.reduce(
        (acc, { id, title, sourceId, metadata }) => {
            if (metadata?.actions) {
                metadata.actions.forEach((action) => {
                    acc[action.id] = [
                        ...(acc[action.id] || []),
                        { id, title, sourceId },
                    ]
                })
            }
            return acc
        },
        {} as GuidanceReferenceContextType['references'],
    )
}

const GuidanceReferenceProvider = <T extends { id: string }>({
    actions,
    children,
}: Props<T>) => {
    const checkEnabled = actions.length > 0
    const { data: queryData, isLoading } =
        useFindAllGuidancesKnowledgeResources(
            {
                actionsIds: actions.map((action) => action.id),
                includeDisabled: true,
            },
            {
                enabled: checkEnabled,
            },
        )

    const data = select(queryData)

    const canBeDeleted = useCallback(
        (actionId: string) => {
            return checkEnabled ? !isLoading && !!data && !data[actionId] : true
        },
        [checkEnabled, data, isLoading],
    )
    return (
        <GuidanceReferenceContext.Provider
            value={{
                canBeDeleted,
                references: data || {},
            }}
        >
            {children}
        </GuidanceReferenceContext.Provider>
    )
}

export default GuidanceReferenceProvider
