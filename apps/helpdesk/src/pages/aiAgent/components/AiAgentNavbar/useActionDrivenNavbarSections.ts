import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import type { AccordionValues } from 'components/Accordion/utils/types'
import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useAiAgentLastSelectedShop } from 'pages/aiAgent/hooks/useAiAgentLastSelectedShop'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { isAiAgentEnabled } from 'pages/aiAgent/util'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import type { NavigationChannelType } from './utils'

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
    const location = useLocation()
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const extractFromUrl = useCallback(() => {
        const pathname = location.pathname
        const match = pathname.match(/\/app\/ai-agent\/(\w+)\/([^/]+)/)
        if (match) {
            const [, integrationType, storeSlug] = match
            return { integrationType, storeSlug }
        }
        return { integrationType: params.shopType, storeSlug: params.shopName }
    }, [params.shopName, params.shopType, location.pathname])

    const urlData = extractFromUrl()
    const currentShopName = params.shopName || urlData.storeSlug
    const currentIntegrationType =
        params.shopType || urlData.integrationType || 'shopify'
    const { setLastSelectedShop, resolveShop } = useAiAgentLastSelectedShop()
    const [selectedStore, setSelectedStore] = useState(currentShopName)

    useEffect(() => {
        if (!currentShopName && storeIntegrations.length > 0) {
            const pathname = location.pathname
            if (pathname.startsWith('/app/ai-agent/actions-platform')) {
                return
            }
            const availableShopNames = storeIntegrations
                .map(getShopNameFromStoreIntegration)
                .filter(Boolean) as string[]
            const resolvedShopName = resolveShop(availableShopNames)
            if (resolvedShopName) {
                history.replace(
                    `/app/ai-agent/${currentIntegrationType}/${resolvedShopName}`,
                )
                setSelectedStore(resolvedShopName)
            }
        }
    }, [
        currentShopName,
        storeIntegrations,
        history,
        currentIntegrationType,
        location.pathname,
        resolveShop,
    ])

    const [expandedSections, setExpandedSections] =
        useLocalStorage<AccordionValues>(ACTION_DRIVEN_NAVBAR_SECTIONS_KEY, [
            ...NAVBAR_SECTIONS,
        ])

    const { navigationItems } = useAiAgentNavigation({
        shopName: selectedStore || currentShopName || '',
    })

    const { storeActivations, allStoreActivations, isFetchLoading } =
        useStoreActivations()

    const selectedStoreIntegration = useMemo(() => {
        return storeIntegrations.find(
            (store) => getShopNameFromStoreIntegration(store) === selectedStore,
        )
    }, [storeIntegrations, selectedStore])

    const getStoreActivationStatus = useCallback(
        (storeName: string): boolean | undefined => {
            if (isFetchLoading) {
                return undefined
            }
            const activation = allStoreActivations[storeName]
            if (!activation) {
                return false
            }

            return isAiAgentEnabledForStore(activation.configuration)
        },
        [allStoreActivations, isFetchLoading],
    )

    const getSetupCompletionStatus = useCallback(
        (storeName: string) => {
            const activation = allStoreActivations[storeName]
            if (!activation) {
                return false
            }

            return true
        },
        [allStoreActivations],
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

            if (channelType === 'sms') {
                return isAiAgentEnabled(
                    configuration.smsChannelDeactivatedDatetime,
                )
            }
            return false
        },
        [storeActivations, selectedStore],
    )

    const handleStoreSelect = useCallback(
        (shopName: string) => {
            setSelectedStore(shopName)
            setLastSelectedShop(shopName)

            const currentPath = location.pathname
            const pathMatch = currentPath.match(
                /\/app\/ai-agent\/(\w+)\/[^/]+\/(.*)/,
            )
            const integrationType = pathMatch
                ? pathMatch[1]
                : currentIntegrationType
            let restOfPath = pathMatch ? pathMatch[2] : ''

            // Strip dynamic IDs from paths when switching stores
            // Only removes segments that look like IDs (all digits or UUID-like patterns)
            // e.g., "opportunities/123" -> "opportunities", "products/456" -> "products"
            restOfPath = restOfPath.replace(/\/(\d+|[a-f0-9-]{8,})$/, '')

            // Check if the destination store has completed setup
            const isSetupCompleted = getSetupCompletionStatus(shopName)

            const shouldRedirectToBase = !isSetupCompleted

            const nextPath = shouldRedirectToBase
                ? `/app/ai-agent/${integrationType}/${shopName}`
                : `/app/ai-agent/${integrationType}/${shopName}${restOfPath ? `/${restOfPath}` : ''}`

            history.push(nextPath)

            setExpandedSections([...NAVBAR_SECTIONS])
        },
        [
            history,
            currentIntegrationType,
            setExpandedSections,
            setLastSelectedShop,
            getSetupCompletionStatus,
            location.pathname,
        ],
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
        getSetupCompletionStatus,
        getChannelStatus,
        navigationItems,
        expandedSections,
        handleExpandedSectionsChange,
        isActivationDataReady:
            !isFetchLoading &&
            (storeIntegrations.length === 0 ||
                Object.keys(allStoreActivations).length > 0),
    }
}
