import { useCallback, useEffect, useMemo, useState } from 'react'

import { useHistory } from 'react-router'

import type { Opportunity, SidebarOpportunityItem } from '../types'
import { isOpportunity } from '../types'
import { useEnrichedOpportunity } from './useEnrichedOpportunity'

interface UseSelectedOpportunityParams {
    shopIntegrationId: number
    opportunities: SidebarOpportunityItem[]
    useKnowledgeService: boolean
    initialOpportunityId?: string
    allowedOpportunityIds?: number[]
    shopType: string
    shopName: string
}

export const useSelectedOpportunity = ({
    shopIntegrationId,
    opportunities,
    useKnowledgeService,
    initialOpportunityId,
    allowedOpportunityIds,
    shopType,
    shopName,
}: UseSelectedOpportunityParams) => {
    const history = useHistory()
    const [selectedOpportunityId, setSelectedOpportunityId] = useState<
        string | null
    >(initialOpportunityId || null)

    const baseSelectedOpportunity = useMemo(
        () =>
            opportunities.find((opp) => opp.id === selectedOpportunityId) ||
            null,
        [opportunities, selectedOpportunityId],
    )

    const shouldFetchDetails =
        useKnowledgeService &&
        !!selectedOpportunityId &&
        (!baseSelectedOpportunity || !isOpportunity(baseSelectedOpportunity))

    const { data: opportunityDetails, isLoading } = useEnrichedOpportunity(
        shopIntegrationId,
        selectedOpportunityId ? parseInt(selectedOpportunityId, 10) : undefined,
        {
            query: {
                enabled: shouldFetchDetails,
                refetchOnWindowFocus: false,
            },
        },
    )

    const isOpportunityAllowed = useCallback(
        (id: string) => {
            if (!allowedOpportunityIds) return true
            return allowedOpportunityIds.includes(Number(id))
        },
        [allowedOpportunityIds],
    )

    const getFirstAllowedOpportunity = useCallback(() => {
        if (!allowedOpportunityIds) {
            return opportunities[0] ?? null
        }

        if (allowedOpportunityIds.length === 0) {
            return null
        }

        return (
            opportunities.filter((opp) => isOpportunityAllowed(opp.id))[0] ??
            null
        )
    }, [allowedOpportunityIds, opportunities, isOpportunityAllowed])

    useEffect(() => {
        if (!opportunities.length) return

        const basePath = `/app/ai-agent/${shopType}/${shopName}/opportunities`

        const redirectToFirstAllowedOrBasePath = () => {
            const firstAllowed = getFirstAllowedOpportunity()
            if (firstAllowed) {
                setSelectedOpportunityId(firstAllowed.id)
            } else {
                setSelectedOpportunityId(null)
                history.replace(basePath)
            }
        }

        if (!selectedOpportunityId) {
            redirectToFirstAllowedOrBasePath()
            return
        }

        if (!isOpportunityAllowed(selectedOpportunityId)) {
            redirectToFirstAllowedOrBasePath()
        }
    }, [
        opportunities,
        selectedOpportunityId,
        shopType,
        shopName,
        history,
        isOpportunityAllowed,
        getFirstAllowedOpportunity,
    ])

    useEffect(() => {
        if (
            selectedOpportunityId &&
            selectedOpportunityId !== initialOpportunityId
        ) {
            const basePath = `/app/ai-agent/${shopType}/${shopName}/opportunities`
            history.replace(`${basePath}/${selectedOpportunityId}`)
        }
    }, [
        selectedOpportunityId,
        initialOpportunityId,
        shopType,
        shopName,
        history,
    ])

    const selectedOpportunity: Opportunity | null = useMemo(() => {
        if (useKnowledgeService) {
            return opportunityDetails || null
        }

        if (baseSelectedOpportunity && isOpportunity(baseSelectedOpportunity)) {
            return baseSelectedOpportunity
        }

        return null
    }, [baseSelectedOpportunity, opportunityDetails, useKnowledgeService])

    return {
        selectedOpportunity,
        selectedOpportunityId,
        setSelectedOpportunityId,
        isLoading: shouldFetchDetails ? isLoading : false,
    }
}
