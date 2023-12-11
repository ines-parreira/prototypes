import React, {useMemo} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useLocalStorage} from 'react-use'
import {useRouteMatch} from 'react-router-dom'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {IntegrationType, StoreIntegration} from 'models/integration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {compare} from 'utils'
import navbarCss from 'assets/css/navbar.less'
import useEffectOnce from 'hooks/useEffectOnce'
import {useIsAutomateRebranding} from '../hooks/useIsAutomateRebranding'
import AutomateNavbarSectionBlock from './AutomateNavbarSectionBlock'

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

const AutomateNavbarView = () => {
    const match = useRouteMatch<{shopType?: string; shopName: string}>({
        path: [
            '/app/automation/:shopType/:shopName/flows',
            '/app/automation/:shopType/:shopName/quick-responses',
            '/app/automation/:shopType/:shopName/order-management',
            '/app/automation/:shopType/:shopName/article-recommendation',
            '/app/automation/:shopType/:shopName/connected-channels',
            '/app/automation/:shopType/:shopName/train-my-ai',
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

    const {isAutomateRebranding} = useIsAutomateRebranding()

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
            <div className={navbarCss.category}>
                {sortedStoreIntegrations.map((storeIntegration) => {
                    const shopType = storeIntegration.type
                    const shopName =
                        getShopNameFromStoreIntegration(storeIntegration)
                    const key: SectionKey = `${shopType}:${shopName}`

                    return (
                        <AutomateNavbarSectionBlock
                            key={key}
                            name={storeIntegration.name}
                            shopType={shopType}
                            shopName={shopName}
                            onToggle={() => {
                                handleToggle(key)
                            }}
                            isExpanded={
                                !!collapsedSections &&
                                !collapsedSections.includes(key)
                            }
                        />
                    )
                })}
            </div>
            {!isAutomateRebranding && !storeIntegrations.length && (
                <Alert
                    className="mx-3 py-3 px-2 mt-4"
                    type={AlertType.Error}
                    icon
                >
                    Add a store integration to start using add-on features
                </Alert>
            )}
        </>
    )
}

export default AutomateNavbarView
