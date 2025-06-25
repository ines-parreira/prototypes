import { ReactNode, useCallback } from 'react'

import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import { Paths } from 'rest_api/knowledge_service_api/client.generated'

import GuidanceReferenceContext, {
    GuidanceReferenceContextType,
} from './GuidanceReferenceContext'

type Props<T extends { id: string }> = {
    actions: Array<T>
    children: ReactNode
}

export const select = (
    data: Paths.FindAllGuidancesKnowledgeResources.Responses.$200,
) => {
    return data.reduce(
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
    const { data, isLoading } = useFindAllGuidancesKnowledgeResources(
        {
            actionsIds: actions.map((action) => action.id),
            includeDisabled: true,
        },
        {
            select,
            enabled: checkEnabled,
        },
    )

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
