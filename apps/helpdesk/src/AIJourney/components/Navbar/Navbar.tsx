import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { NavLink, useHistory, useParams } from 'react-router-dom'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import { JourneyProvider, useJourneyContext } from 'AIJourney/providers'
import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import css from './Navbar.less'

const AiJourneyNavbarComponent = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const isAiJourneyAnalyticsEnabled = useFlag(
        FeatureFlagKey.AiJourneyAnalyticsEnabled,
    )

    const { journey: abandonedCartJourney } = useJourneyContext()

    const history = useHistory()

    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const [selectedStore, setSelectedStore] = useState(shopName)

    const hasJourney = useMemo(() => {
        return !!abandonedCartJourney && !!abandonedCartJourney.id
    }, [abandonedCartJourney])

    const isJourneyDraft = useMemo(
        () =>
            hasJourney &&
            abandonedCartJourney?.state === JourneyStatusEnum.Draft,
        [abandonedCartJourney, hasJourney],
    )

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

    const shouldAccessAnalytics =
        isAiJourneyAnalyticsEnabled && hasJourney && !isJourneyDraft

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

export const AiJourneyNavbar = () => (
    <JourneyProvider journeyType="cart_abandoned">
        <AiJourneyNavbarComponent />
    </JourneyProvider>
)
