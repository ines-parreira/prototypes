import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { NavLink, useHistory, useParams } from 'react-router-dom'

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

    const { journeys } = useJourneyContext()

    const history = useHistory()

    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const [selectedStore, setSelectedStore] = useState(shopName)

    const hasJourney = useMemo(() => {
        return journeys?.length !== 0
    }, [journeys])

    const selectedStoreIntegration = useMemo(() => {
        return storeIntegrations.find(
            (store) => getShopNameFromStoreIntegration(store) === selectedStore,
        )
    }, [storeIntegrations, selectedStore])

    useEffect(() => {
        if (shopName) {
            setSelectedStore(shopName)
        } else if (!shopName && storeIntegrations.length > 0) {
            const firstStore = storeIntegrations[0]
            const firstShopName = getShopNameFromStoreIntegration(firstStore)
            if (firstShopName) {
                history.replace(`/app/ai-journey/${firstShopName}`)
                setSelectedStore(firstShopName)
            }
        }
    }, [shopName, storeIntegrations, history])

    const handleStoreChange = useCallback(
        (id: number) => {
            const integration = storeIntegrations.find((i) => i.id === id)
            if (!integration) return
            const shopName = getShopNameFromStoreIntegration(integration)
            history.push(`/app/ai-journey/${shopName}`)
        },
        [storeIntegrations, history],
    )

    const shouldAccessPlayground = isAiJourneyPlaygroundEnabled && hasJourney
    const shouldAccessAnalytics = isAiJourneyAnalyticsEnabled && hasJourney
    const shouldAccessCampaigns = isAiJourneyCampaignsEnabled && hasJourney

    return (
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
                    <Navigation.SectionItem
                        as={NavLink}
                        to={
                            hasJourney
                                ? `/app/ai-journey/${shopName}/performance`
                                : `/app/ai-journey/${shopName}`
                        }
                        exact
                    >
                        {hasJourney ? 'Overview' : 'Setup'}
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
