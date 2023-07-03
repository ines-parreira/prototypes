import React, {useMemo, useState} from 'react'
import {useEffectOnce, useLocalStorage} from 'react-use'
import {useRouteMatch} from 'react-router-dom'

import useStoreIntegrations from 'pages/automation/common/hooks/useStoreIntegrations'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {IntegrationType, StoreIntegration} from 'models/integration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {compare} from 'utils'

import AutomationNavbarAddOnSectionBlock from './AutomationNavbarAddOnSectionBlock'

import {
    AUTOMATION_NAVBAR_COLLAPSED_AAO_SECTIONS_KEY,
    MAX_EXPANDED_AAO_SECTIONS_BY_DEFAULT,
} from './constants'

type SectionKey = `${ShopType}:${string}`

const getSectionKeyFromStoreIntegration = (
    integration: StoreIntegration
): SectionKey => {
    return `${integration.type}:${getShopNameFromStoreIntegration(integration)}`
}

const AutomationNavbarAddOnView = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModal,
    ] = useState(false)

    const match = useRouteMatch<{shopType?: string; shopName: string}>({
        path: [
            '/app/automation/:shopType/:shopName/flows',
            '/app/automation/:shopType/:shopName/quick-responses',
            '/app/automation/:shopType/:shopName/order-management',
            '/app/automation/:shopType/:shopName/article-recommendation',
            '/app/automation/:shopType/:shopName/connected-channels',
        ],
        exact: false,
    })
    const storeIntegrations = useStoreIntegrations()
    const sortedStoreIntegrations = useMemo(
        () => [...storeIntegrations].sort((a, b) => compare(a.name, b.name)),
        [storeIntegrations]
    )
    const initialCollapsedSections = useMemo(
        () =>
            storeIntegrations.length > MAX_EXPANDED_AAO_SECTIONS_BY_DEFAULT
                ? storeIntegrations.map(getSectionKeyFromStoreIntegration)
                : [],
        [storeIntegrations]
    )
    const [collapsedSections, setCollapsedSections] = useLocalStorage<string[]>(
        AUTOMATION_NAVBAR_COLLAPSED_AAO_SECTIONS_KEY,
        initialCollapsedSections
    )

    useEffectOnce(() => {
        if (!collapsedSections || !match) {
            return
        }

        const {shopType = IntegrationType.Shopify, shopName} = match.params
        const key = `${shopType}:${shopName}`

        const newCollapsedSections = [...collapsedSections]
        const index = newCollapsedSections.indexOf(key)

        if (index !== -1) {
            newCollapsedSections.splice(index, 1)

            setCollapsedSections(newCollapsedSections)
        }
    })

    const handleToggle = (key: SectionKey) => {
        if (!collapsedSections) {
            return
        }

        const newCollapsedSections = [...collapsedSections]

        const index = newCollapsedSections.indexOf(key)

        if (index !== -1) {
            newCollapsedSections.splice(index, 1)
        } else {
            newCollapsedSections.push(key)
        }

        setCollapsedSections(newCollapsedSections)
    }

    return (
        <>
            <div className="mt-3">
                {sortedStoreIntegrations.map((storeIntegration) => {
                    const shopType = storeIntegration.type
                    const shopName =
                        getShopNameFromStoreIntegration(storeIntegration)
                    const key: SectionKey = `${shopType}:${shopName}`

                    return (
                        <AutomationNavbarAddOnSectionBlock
                            key={key}
                            name={storeIntegration.name}
                            shopType={shopType}
                            shopName={shopName}
                            onToggle={() => {
                                handleToggle(key)
                            }}
                            onSubscribeToAutomationAddOnClick={() => {
                                setIsAutomationSubscriptionModal(true)
                            }}
                            isExpanded={
                                !!collapsedSections &&
                                !collapsedSections.includes(key)
                            }
                        />
                    )
                })}
                {!storeIntegrations.length && (
                    <Alert
                        className="mx-3 py-3 px-2 mt-4"
                        type={AlertType.Error}
                        icon
                    >
                        Add a store integration to start using add-on features
                    </Alert>
                )}
            </div>
            <AutomationSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationSubscriptionModalOpen}
                onClose={() => setIsAutomationSubscriptionModal(false)}
            />
        </>
    )
}

export default AutomationNavbarAddOnView
