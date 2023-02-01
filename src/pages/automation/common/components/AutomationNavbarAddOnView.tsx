import React, {useState, useMemo} from 'react'
import {useLocalStorage} from 'react-use'

import useStoreIntegrations from 'pages/automation/common/hooks/useStoreIntegrations'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {compare} from 'utils'

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

    const storeIntegrations = useStoreIntegrations()
    const sortedStoreIntegrations = useMemo(
        () => [...storeIntegrations].sort((a, b) => compare(a.name, b.name)),
        [storeIntegrations]
    )

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
                {sortedStoreIntegrations.map((storeIntegration) => {
                    const shopType = storeIntegration.type
                    const shopName =
                        getShopNameFromStoreIntegration(storeIntegration)
                    const key = `${shopType}:${shopName}` as const

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
