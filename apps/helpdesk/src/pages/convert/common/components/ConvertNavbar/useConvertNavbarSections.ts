import { useCallback, useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { useRouteMatch } from 'react-router'

import { AccordionValues } from 'components/Accordion/utils/types'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'

import {
    CONVERT_NAVBAR_EXPANDED_SECTIONS_KEY,
    CONVERT_ROUTING_PARAM,
    MAX_EXPANDED_SECTIONS_BY_DEFAULT,
} from '../../constants'
import { useGetSortedIntegrations } from '../../hooks/useGetSortedIntegrations'

type SectionKey = `${IntegrationType.GorgiasChat}:${string}`

const getSectionKeyFromIntegration = (
    integration: GorgiasChatIntegration,
): SectionKey => {
    return `${integration.type}:${integration.id}`
}

export const useConvertNavbarSections = () => {
    const convertPathPrefix = `/app/convert/${CONVERT_ROUTING_PARAM}`

    const match = useRouteMatch<{ id: string }>({
        path: [
            `${convertPathPrefix}/setup`,
            `${convertPathPrefix}/performance`,
            `${convertPathPrefix}/campaigns`,
            `${convertPathPrefix}/click-tracking`,
            `${convertPathPrefix}/installation`,
            `${convertPathPrefix}/settings`,
        ],
        exact: false,
    })

    const { id } = match?.params ?? {}
    const defaultKey: SectionKey | undefined = id
        ? (`${IntegrationType.GorgiasChat}:${id}` as SectionKey)
        : undefined

    const sortedIntegrations = useGetSortedIntegrations()
    const initialCollapsedSections = useMemo(
        () =>
            sortedIntegrations.length > MAX_EXPANDED_SECTIONS_BY_DEFAULT
                ? sortedIntegrations
                      .slice(MAX_EXPANDED_SECTIONS_BY_DEFAULT)
                      .map(getSectionKeyFromIntegration)
                : [],
        [sortedIntegrations],
    )

    const [sections, setSections] = useLocalStorage<AccordionValues>(
        CONVERT_NAVBAR_EXPANDED_SECTIONS_KEY,
        initialCollapsedSections,
    )

    const [sectionsWithDefaultKey, setSectionsWithDefaultKey] =
        useState<AccordionValues>(() => {
            const firstSections = sections.slice(0, -1)

            return defaultKey && !sections.includes(defaultKey)
                ? [...firstSections, defaultKey]
                : sections
        })

    const handleNavigationStateChange = useCallback(
        (navigationValues: AccordionValues) => {
            setSections(navigationValues)
            setSectionsWithDefaultKey(navigationValues)
        },
        [setSections],
    )

    return {
        sections: sectionsWithDefaultKey,
        handleNavigationStateChange,
    }
}
