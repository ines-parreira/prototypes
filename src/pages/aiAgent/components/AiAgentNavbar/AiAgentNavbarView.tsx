import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import useLocalStorage from 'hooks/useLocalStorage'
import {IntegrationType, StoreIntegration} from 'models/integration/types'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import {
    AI_AGENT_NAVBAR_COLLAPSED_SECTIONS_KEY,
    AI_AGENT_MAX_EXPANDED_SECTIONS_BY_DEFAULT,
} from 'pages/aiAgent/constants'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {compare} from 'utils'

import {AiAgentNavbarSectionBlock} from './AiAgentNavbarSectionBlock'

type SectionKey = `${ShopType}:${string}`

const getSectionKeyFromStoreIntegration = (
    integration: StoreIntegration
): SectionKey => {
    return `${integration.type}:${getShopNameFromStoreIntegration(integration)}`
}

export const AiAgentNavbarView = () => {
    const match = useRouteMatch<{shopType?: string; shopName: string}>({
        path: ['/app/ai-agent/:shopType/:shopName'],
        exact: false,
    })
    const getShopifyIntegrations = useMemo(
        () => getIntegrationsByType<StoreIntegration>(IntegrationType.Shopify),
        []
    )
    const storeIntegrations = useAppSelector(getShopifyIntegrations)
    const sortedStoreIntegrations = useMemo(
        () => [...storeIntegrations].sort((a, b) => compare(a.name, b.name)),
        [storeIntegrations]
    )
    const initialCollapsedSections = useMemo(
        () =>
            storeIntegrations.length > AI_AGENT_MAX_EXPANDED_SECTIONS_BY_DEFAULT
                ? storeIntegrations.map(getSectionKeyFromStoreIntegration)
                : [],
        [storeIntegrations]
    )
    const [collapsedSections, setCollapsedSections] = useLocalStorage<string[]>(
        AI_AGENT_NAVBAR_COLLAPSED_SECTIONS_KEY,
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
        <div className={navbarCss.category}>
            {sortedStoreIntegrations.map((storeIntegration) => {
                const shopType = storeIntegration.type
                const shopName =
                    getShopNameFromStoreIntegration(storeIntegration)
                const key: SectionKey = `${shopType}:${shopName}`

                return (
                    <AiAgentNavbarSectionBlock
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
    )
}
