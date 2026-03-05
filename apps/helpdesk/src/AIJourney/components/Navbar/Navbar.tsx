import { useCallback, useEffect, useMemo } from 'react'

import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2WayfindingMS1Flag,
} from '@repo/feature-flags'
import { useSidebar } from '@repo/navigation'
import { matchPath, NavLink, useHistory, useLocation } from 'react-router-dom'

import type { IconName } from '@gorgias/axiom'

import { useLastSelectedStore } from 'AIJourney/hooks'
import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'
import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { CollapsedAiJourneyNavigation } from './CollapsedAiJourneyNavigation'

import css from './Navbar.less'

export const AiJourneyNavbar = () => {
    const history = useHistory()
    const location = useLocation()
    const { isCollapsed } = useSidebar()
    const match = matchPath<{ shopName: string }>(location.pathname, {
        path: '/app/ai-journey/:shopName',
    })
    const shopName = match?.params.shopName

    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const isAiJourneyAnalyticsEnabled = useFlag(
        FeatureFlagKey.AiJourneyAnalyticsEnabled,
    )

    const isAiJourneyPlaygroundEnabled = useFlag(
        FeatureFlagKey.AiJourneyPlaygroundEnabled,
    )

    const isAiJourneyCampaignsEnabled = useFlag(
        FeatureFlagKey.AiJourneyCampaignsEnabled,
    )

    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const { setLastSelectedStore, resolveStore } = useLastSelectedStore()

    const selectedStoreIntegration = useMemo(() => {
        return storeIntegrations.find(
            (store) => getShopNameFromStoreIntegration(store) === shopName,
        )
    }, [storeIntegrations, shopName])

    useEffect(() => {
        if (shopName) {
            setLastSelectedStore(shopName)
            return
        }

        const availableStoreNames = storeIntegrations
            .map(getShopNameFromStoreIntegration)
            .filter((name): name is string => name !== null)

        const resolvedStore = resolveStore(availableStoreNames)
        if (!resolvedStore) {
            return
        }

        history.replace(`/app/ai-journey/${resolvedStore}`)
    }, [
        shopName,
        storeIntegrations,
        history,
        resolveStore,
        setLastSelectedStore,
    ])

    const handleStoreChange = useCallback(
        (id: number) => {
            const integration = storeIntegrations.find((i) => i.id === id)
            if (!integration) return
            const shopName = getShopNameFromStoreIntegration(integration)
            history.push(`/app/ai-journey/${shopName}`)
            setLastSelectedStore(shopName)
        },
        [storeIntegrations, history, setLastSelectedStore],
    )

    const shouldAccessPlayground = isAiJourneyPlaygroundEnabled
    const shouldAccessAnalytics = isAiJourneyAnalyticsEnabled
    const shouldAccessCampaigns = isAiJourneyCampaignsEnabled

    const navigationItems = useMemo(() => {
        const items: Array<{
            icon: IconName
            to: string
            label: string
            exact?: boolean
            isActive?: (match: any, location: any) => boolean
        }> = []

        if (shouldAccessAnalytics) {
            items.push({
                icon: 'chart-line-alt',
                to: `/app/ai-journey/${shopName}/analytics`,
                label: 'Analytics',
                exact: true,
            })
        }

        if (shouldAccessCampaigns) {
            items.push({
                icon: 'nav-flag',
                to: `/app/ai-journey/${shopName}/campaigns`,
                label: 'Campaigns',
                isActive: (_, location) =>
                    location.pathname.includes('campaign'),
            })
        }

        items.push({
            icon: 'flows',
            to: `/app/ai-journey/${shopName}/flows`,
            label: 'Flows',
            exact: true,
        })

        if (shouldAccessPlayground) {
            items.push({
                icon: 'media-play-circle',
                to: `/app/ai-journey/${shopName}/playground`,
                label: 'Playground',
                exact: true,
            })
        }

        return items
    }, [
        shopName,
        shouldAccessCampaigns,
        shouldAccessPlayground,
        shouldAccessAnalytics,
    ])

    if (hasWayfindingMS1Flag) {
        return isCollapsed && navigationItems.length > 0 ? (
            <CollapsedAiJourneyNavigation navigationItems={navigationItems} />
        ) : (
            <Navbar activeContent={ActiveContent.AiJourney} title="AI Journey">
                <Navigation.Root className={css.container}>
                    <StoreSelector
                        integrations={storeIntegrations}
                        selected={selectedStoreIntegration}
                        onChange={handleStoreChange}
                        enableDynamicHeight
                        fullWidth
                        singleStoreInline
                        buttonClassName={css.storeSelectorButton}
                        hideSelectedFromDropdown
                        applyClassicThemeOverride
                    />
                    <div className={css.navigationSections}>
                        {navigationItems.map((item) => (
                            <Navigation.SectionItem
                                key={item.to}
                                as={NavLink}
                                icon={item.icon}
                                to={item.to}
                                exact={item.exact}
                                isActive={item.isActive}
                            >
                                {item.label}
                            </Navigation.SectionItem>
                        ))}
                    </div>
                </Navigation.Root>
            </Navbar>
        )
    }

    return (
        <Navbar activeContent={ActiveContent.AiJourney} title="AI Journey">
            <Navigation.Root className={css.container}>
                <div className={css.storeSelector}>
                    <StoreSelector
                        integrations={storeIntegrations}
                        selected={selectedStoreIntegration}
                        onChange={handleStoreChange}
                        enableDynamicHeight
                        fullWidth
                        singleStoreInline
                        buttonClassName={css.storeSelectorButton}
                        hideSelectedFromDropdown
                        applyClassicThemeOverride
                    />
                </div>
                <div className={css.navigationSections}>
                    {shouldAccessAnalytics && (
                        <Navigation.SectionItem
                            as={NavLink}
                            exact
                            to={`/app/ai-journey/${shopName}/analytics`}
                        >
                            Analytics
                        </Navigation.SectionItem>
                    )}
                    {shouldAccessCampaigns && (
                        <Navigation.SectionItem
                            as={NavLink}
                            isActive={(_, location) => {
                                return location.pathname.includes('campaign')
                            }}
                            to={`/app/ai-journey/${shopName}/campaigns`}
                        >
                            Campaigns
                        </Navigation.SectionItem>
                    )}
                    <Navigation.SectionItem
                        as={NavLink}
                        to={`/app/ai-journey/${shopName}/flows`}
                        exact
                    >
                        Flows
                    </Navigation.SectionItem>
                    {shouldAccessPlayground && (
                        <Navigation.SectionItem
                            as={NavLink}
                            exact
                            to={`/app/ai-journey/${shopName}/playground`}
                        >
                            Playground
                        </Navigation.SectionItem>
                    )}
                </div>
            </Navigation.Root>
        </Navbar>
    )
}
