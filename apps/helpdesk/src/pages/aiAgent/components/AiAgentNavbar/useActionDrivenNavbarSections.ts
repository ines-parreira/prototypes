import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { AccordionValues } from 'components/Accordion/utils/types'
import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { isAiAgentEnabled } from 'pages/aiAgent/util'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
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
    const [selectedStore, setSelectedStore] = useState(currentShopName)

    useEffect(() => {
        if (!currentShopName && storeIntegrations.length > 0) {
            const pathname = location.pathname
            if (pathname.startsWith('/app/ai-agent/actions-platform')) {
                return
            }
            const firstStore = storeIntegrations[0]
            const firstShopName = getShopNameFromStoreIntegration(firstStore)
            if (firstShopName) {
                history.replace(
                    `/app/ai-agent/${currentIntegrationType}/${firstShopName}`,
                )
                setSelectedStore(firstShopName)
            }
        }
    }, [
        currentShopName,
        storeIntegrations,
        history,
        currentIntegrationType,
        location.pathname,
    ])

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
            if (!activation) {
                return false
            }

            return isAiAgentEnabledForStore(activation.configuration)
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

            const currentPath = location.pathname
            const pathMatch = currentPath.match(
                /\/app\/ai-agent\/(\w+)\/[^/]+\/(.*)/,
            )
            const integrationType = pathMatch
                ? pathMatch[1]
                : currentIntegrationType
            const restOfPath = pathMatch ? pathMatch[2] : ''

            const isActivated = getStoreActivationStatus(shopName)
            const nextPath = isActivated
                ? `/app/ai-agent/${integrationType}/${shopName}${restOfPath ? `/${restOfPath}` : ''}`
                : `/app/ai-agent/${integrationType}/${shopName}`

            history.push(nextPath)

            setExpandedSections([...NAVBAR_SECTIONS])
        },
        [
            history,
            currentIntegrationType,
            setExpandedSections,
            getStoreActivationStatus,
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
        getChannelStatus,
        navigationItems,
        expandedSections,
        handleExpandedSectionsChange,
    }
}
