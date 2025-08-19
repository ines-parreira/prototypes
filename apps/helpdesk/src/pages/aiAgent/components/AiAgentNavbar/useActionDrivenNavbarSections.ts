import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { useHistory, useParams } from 'react-router-dom'

import { AccordionValues } from 'components/Accordion/utils/types'
import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { isAiAgentEnabled } from 'pages/aiAgent/util'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { NavigationChannelType } from './utils'

const ACTION_DRIVEN_NAVBAR_SECTIONS_KEY =
    'ai-agent:action-driven-navbar:sections'

const NAVBAR_SECTIONS = [
    'analyze',
    'train',
    'test',
    'deploy',
    'settings',
] as const

export const useActionDrivenNavbarSections = () => {
    const params = useParams<{ shopName?: string; shopType?: string }>()
    const history = useHistory()
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const extractFromUrl = useCallback(() => {
        const pathname = window.location.pathname
        const match = pathname.match(/\/app\/ai-agent\/(\w+)\/([^/]+)/)
        if (match) {
            const [, integrationType, storeSlug] = match
            return { integrationType, storeSlug }
        }
        return { integrationType: params.shopType, storeSlug: params.shopName }
    }, [params.shopName, params.shopType])

    const urlData = extractFromUrl()
    const currentShopName = params.shopName || urlData.storeSlug
    const currentIntegrationType =
        params.shopType || urlData.integrationType || 'shopify'
    const [selectedStore, setSelectedStore] = useState(currentShopName)

    useEffect(() => {
        if (!currentShopName && storeIntegrations.length > 0) {
            const firstStore = storeIntegrations[0]
            const firstShopName = getShopNameFromStoreIntegration(firstStore)
            if (firstShopName) {
                history.replace(
                    `/app/ai-agent/${currentIntegrationType}/${firstShopName}/overview`,
                )
                setSelectedStore(firstShopName)
            }
        }
    }, [currentShopName, storeIntegrations, history, currentIntegrationType])

    const [expandedSections, setExpandedSections] =
        useLocalStorage<AccordionValues>(ACTION_DRIVEN_NAVBAR_SECTIONS_KEY, [
            ...NAVBAR_SECTIONS,
        ])

    const { navigationItems } = useAiAgentNavigation({
        shopName: selectedStore || currentShopName || '',
    })

    const { storeActivations } = useStoreActivations()

    const selectedStoreIntegration = useMemo(() => {
        return storeIntegrations.find(
            (store) => getShopNameFromStoreIntegration(store) === selectedStore,
        )
    }, [storeIntegrations, selectedStore])

    const getStoreActivationStatus = useCallback(
        (storeName: string) => {
            const activation = storeActivations[storeName]
            if (!activation) return false

            const { configuration } = activation
            const hasActiveChat = isAiAgentEnabled(
                configuration.chatChannelDeactivatedDatetime,
            )
            const hasActiveEmail = isAiAgentEnabled(
                configuration.emailChannelDeactivatedDatetime,
            )

            return hasActiveChat || hasActiveEmail
        },
        [storeActivations],
    )

    const getChannelStatus = useCallback(
        (channelType: NavigationChannelType) => {
            if (!selectedStore) return false
            const activation = storeActivations[selectedStore]
            if (!activation) return false

            const { configuration } = activation

            if (channelType === 'chat') {
                return isAiAgentEnabled(
                    configuration.chatChannelDeactivatedDatetime,
                )
            }
            if (channelType === 'email') {
                return isAiAgentEnabled(
                    configuration.emailChannelDeactivatedDatetime,
                )
            }
            return false
        },
        [storeActivations, selectedStore],
    )

    const handleStoreSelect = useCallback(
        (shopName: string) => {
            setSelectedStore(shopName)

            const currentPath = window.location.pathname
            const pathMatch = currentPath.match(
                /\/app\/ai-agent\/(\w+)\/[^/]+\/(.*)/,
            )
            const integrationType = pathMatch
                ? pathMatch[1]
                : currentIntegrationType
            const restOfPath = pathMatch ? pathMatch[2] : 'overview'

            history.push(
                `/app/ai-agent/${integrationType}/${shopName}/${restOfPath}`,
            )

            setExpandedSections([...NAVBAR_SECTIONS])
        },
        [history, currentIntegrationType, setExpandedSections],
    )

    const handleExpandedSectionsChange = useCallback(
        (value: AccordionValues) => {
            setExpandedSections(value)
        },
        [setExpandedSections],
    )

    return {
        selectedStore,
        selectedStoreIntegration,
        storeIntegrations,
        handleStoreSelect,
        getStoreActivationStatus,
        getChannelStatus,
        navigationItems,
        expandedSections,
        handleExpandedSectionsChange,
    }
}
