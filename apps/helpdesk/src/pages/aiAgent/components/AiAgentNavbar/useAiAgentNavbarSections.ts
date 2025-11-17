import { useCallback, useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { useRouteMatch } from 'react-router-dom'

import type { AccordionValues } from 'components/Accordion/utils/types'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import {
    AI_AGENT_MAX_EXPANDED_SECTIONS_BY_DEFAULT,
    AI_AGENT_NAVBAR_EXPANDED_SECTIONS_KEY,
} from 'pages/aiAgent/constants'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import type { SectionKey } from './utils'
import { getSectionKeyFromStoreIntegration } from './utils'

export const useAiAgentNavbarSections = () => {
    const match = useRouteMatch<{ shopType?: string; shopName: string }>({
        path: ['/app/ai-agent/:shopType/:shopName'],
        exact: false,
    })

    const { shopType = IntegrationType.Shopify, shopName } = match?.params ?? {}
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const defaultKey: SectionKey | undefined =
        shopType && shopName
            ? (`${shopType}:${shopName}` as SectionKey)
            : undefined
    const initialExpandedSections = useMemo(
        () =>
            storeIntegrations.length > AI_AGENT_MAX_EXPANDED_SECTIONS_BY_DEFAULT
                ? []
                : storeIntegrations.map(getSectionKeyFromStoreIntegration),
        [storeIntegrations],
    )
    const [sections, setSections] = useLocalStorage<AccordionValues>(
        AI_AGENT_NAVBAR_EXPANDED_SECTIONS_KEY,
        initialExpandedSections,
    )

    const [sectionsWithDefaultKey, setSectionsWithDefaultKey] =
        useState<AccordionValues>(() => {
            const firstSections = sections.slice(0, -1)

            return defaultKey && !sections.includes(defaultKey)
                ? [...firstSections, defaultKey]
                : sections
        })

    const handleNavigationStateChange = useCallback(
        (navigationValus: AccordionValues) => {
            setSections(navigationValus)
            setSectionsWithDefaultKey(navigationValus)
        },
        [setSections],
    )

    return {
        sections: sectionsWithDefaultKey,
        handleNavigationStateChange,
    }
}
