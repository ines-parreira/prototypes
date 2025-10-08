import React, { useMemo } from 'react'

import { useEffectOnce, useLocalStorage } from '@repo/hooks'
import { useRouteMatch } from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { compare } from 'utils'

import AutomateNavbarSectionBlock from './AutomateNavbarSectionBlock'
import {
    AUTOMATION_NAVBAR_COLLAPSED_AAO_SECTIONS_KEY,
    MAX_EXPANDED_AAO_SECTIONS_BY_DEFAULT,
} from './constants'

type SectionKey = `${ShopType}:${string}`

const getSectionKeyFromStoreIntegration = (
    integration: StoreIntegration,
): SectionKey => {
    return `${integration.type}:${getShopNameFromStoreIntegration(integration)}`
}

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
const AutomateNavbarView = () => {
    const match = useRouteMatch<{ shopType?: string; shopName: string }>({
        path: [
            '/app/automation/:shopType/:shopName/ai-agent',
            '/app/automation/:shopType/:shopName/flows',
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
        [storeIntegrations],
    )
    const initialCollapsedSections = useMemo(
        () =>
            storeIntegrations.length > MAX_EXPANDED_AAO_SECTIONS_BY_DEFAULT
                ? storeIntegrations.map(getSectionKeyFromStoreIntegration)
                : [],
        [storeIntegrations],
    )
    const [collapsedSections, setCollapsedSections] = useLocalStorage<string[]>(
        AUTOMATION_NAVBAR_COLLAPSED_AAO_SECTIONS_KEY,
        initialCollapsedSections,
    )

    useEffectOnce(() => {
        if (!collapsedSections || !match) {
            return
        }

        const { shopType = IntegrationType.Shopify, shopName } = match.params
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

    const firstShopifyIntegration = useMemo(
        () =>
            sortedStoreIntegrations.find(
                (integration) => integration.type === IntegrationType.Shopify,
            ),
        [sortedStoreIntegrations],
    )
    return (
        <div className={navbarCss.category}>
            {sortedStoreIntegrations.map((storeIntegration) => {
                const shopType = storeIntegration.type
                const shopName =
                    getShopNameFromStoreIntegration(storeIntegration)
                const key: SectionKey = `${shopType}:${shopName}`
                const isFirstShopifyIntegration =
                    firstShopifyIntegration?.id === storeIntegration.id

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
                        shouldRenderCanduIds={isFirstShopifyIntegration}
                    />
                )
            })}
        </div>
    )
}

export default AutomateNavbarView
