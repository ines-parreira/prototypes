import React from 'react'

import { Navigation } from 'components/Navigation/Navigation'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'

import { ActionDrivenNavigationItems } from './ActionDrivenNavigationItems'
import { useActionDrivenNavbarSections } from './useActionDrivenNavbarSections'

import css from './AiAgentNavbar.less'

export const ActionDrivenNavigation = () => {
    const {
        selectedStore,
        selectedStoreIntegration,
        storeIntegrations,
        handleStoreSelect,
        getStoreActivationStatus,
        getChannelStatus,
        navigationItems,
        expandedSections,
        handleExpandedSectionsChange,
    } = useActionDrivenNavbarSections()

    return (
        <Navigation.Root
            className={css.navigation}
            value={expandedSections}
            onValueChange={handleExpandedSectionsChange}
        >
            <div className={css.storeSelector}>
                <StoreSelector
                    integrations={storeIntegrations}
                    selected={selectedStoreIntegration}
                    onChange={(id) => {
                        const integration = storeIntegrations.find(
                            (i) => i.id === id,
                        )
                        if (!integration) return
                        const shopName =
                            getShopNameFromStoreIntegration(integration)
                        handleStoreSelect(shopName)
                    }}
                    shouldShowActiveStatus={(integration) =>
                        getStoreActivationStatus(
                            getShopNameFromStoreIntegration(integration),
                        )
                    }
                    fullWidth
                    singleStoreInline
                    buttonClassName={css.storeSelectorButton}
                />
            </div>

            <ActionDrivenNavigationItems
                navigationItems={navigationItems}
                selectedStore={selectedStore}
                getChannelStatus={getChannelStatus}
            />
        </Navigation.Root>
    )
}
