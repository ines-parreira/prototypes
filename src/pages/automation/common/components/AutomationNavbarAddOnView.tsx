import React, {useState} from 'react'
import {useLocalStorage} from 'react-use'

import useShopifyIntegrations from 'pages/automation/common/hooks/useShopifyIntegrations'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {ShopType} from 'models/selfServiceConfiguration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import AutomationNavbarAddOnSectionBlock from './AutomationNavbarAddOnSectionBlock'

import {AUTOMATION_NAVBAR_COLLAPSED_SELF_SERVICE_SECTIONS_KEY} from './constants'

const AutomationNavbarAddOnView = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModal,
    ] = useState(false)
    const [collapsedSections, setCollapsedSections] = useLocalStorage<string[]>(
        AUTOMATION_NAVBAR_COLLAPSED_SELF_SERVICE_SECTIONS_KEY,
        []
    )

    const shopifyIntegrations = useShopifyIntegrations()

    const handleToggle = (key: `${ShopType}:${string}`) => {
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
                {shopifyIntegrations.map((shopifyIntegration) => {
                    const shopName = shopifyIntegration.meta.shop_name
                    const key = `shopify:${shopName}` as const

                    return (
                        <AutomationNavbarAddOnSectionBlock
                            key={key}
                            shopifyIntegration={shopifyIntegration}
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
                {!shopifyIntegrations.length && (
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
