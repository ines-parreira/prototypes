import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { NavLink, useHistory, useParams } from 'react-router-dom'

import { useLastSelectedStore } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'
import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import css from './Navbar.less'

export const AiJourneyNavbar = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const isAiJourneyAnalyticsEnabled = useFlag(
        FeatureFlagKey.AiJourneyAnalyticsEnabled,
    )

    const isAiJourneyPlaygroundEnabled = useFlag(
        FeatureFlagKey.AiJourneyPlaygroundEnabled,
    )

    const isAiJourneyCampaignsEnabled = useFlag(
        FeatureFlagKey.AiJourneyCampaignsEnabled,
    )

    const { campaigns, journeys } = useJourneyContext()

    const history = useHistory()

    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const { setLastSelectedStore, resolveStore } = useLastSelectedStore()

    const [selectedStore, setSelectedStore] = useState(shopName)

    const hasJourney = useMemo(() => {
        return journeys?.length !== 0
    }, [journeys])

    const hasCampaigns = useMemo(() => {
        return campaigns?.length !== 0
    }, [campaigns])

    const selectedStoreIntegration = useMemo(() => {
        return storeIntegrations.find(
            (store) => getShopNameFromStoreIntegration(store) === selectedStore,
        )
    }, [storeIntegrations, selectedStore])

    useEffect(() => {
        if (shopName) {
            setSelectedStore(shopName)
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
        setSelectedStore(resolvedStore)
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

    const shouldAccessPlayground =
        isAiJourneyPlaygroundEnabled && (hasJourney || hasCampaigns)
    const shouldAccessAnalytics =
        isAiJourneyAnalyticsEnabled && (hasJourney || hasCampaigns)
    const shouldAccessCampaigns = isAiJourneyCampaignsEnabled && hasJourney

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
                    <Navigation.SectionItem
                        as={NavLink}
                        to={
                            hasJourney
                                ? `/app/ai-journey/${shopName}/flows`
                                : `/app/ai-journey/${shopName}`
                        }
                        exact
                    >
                        {hasJourney ? 'Flows' : 'Setup'}
                    </Navigation.SectionItem>
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
                    {shouldAccessPlayground && (
                        <Navigation.SectionItem
                            as={NavLink}
                            exact
                            to={`/app/ai-journey/${shopName}/playground`}
                        >
                            Playground
                        </Navigation.SectionItem>
                    )}
                    {shouldAccessAnalytics && (
                        <Navigation.SectionItem
                            as={NavLink}
                            exact
                            to={`/app/ai-journey/${shopName}/analytics`}
                        >
                            Analytics
                        </Navigation.SectionItem>
                    )}
                </div>
            </Navigation.Root>
        </Navbar>
    )
}
