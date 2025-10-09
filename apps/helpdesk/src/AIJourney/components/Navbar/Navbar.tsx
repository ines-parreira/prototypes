import { useCallback, useEffect, useMemo, useState } from 'react'

import { NavLink, useHistory, useParams } from 'react-router-dom'

import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'
import useAppSelector from 'hooks/useAppSelector'
import { StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import css from './Navbar.less'

export const AiJourneyNavbar = () => {
    const { shopName } = useParams<{ shopName: string }>()

    const history = useHistory()

    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)
    const { storeActivations } = useStoreActivations()

    const [selectedStore, setSelectedStore] = useState(shopName)

    const selectedStoreIntegration = useMemo(() => {
        return storeIntegrations.find(
            (store) => getShopNameFromStoreIntegration(store) === selectedStore,
        )
    }, [storeIntegrations, selectedStore])

    const getStoreActivationStatus = useCallback(
        (storeName: string) => {
            const activation = storeActivations[storeName]
            if (!activation) {
                return false
            }

            return isAiAgentEnabledForStore(activation.configuration)
        },
        [storeActivations],
    )

    // oxlint-disable-next-line no-console
    console.log('selectedStore', selectedStore)

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

    const shouldShowActiveStatus = useCallback(
        (integration: StoreIntegration) => {
            return getStoreActivationStatus(
                getShopNameFromStoreIntegration(integration),
            )
        },
        [getStoreActivationStatus],
    )

    return (
        <Navbar activeContent={ActiveContent.AiJourney} title="AI Journey">
            <Navigation.Root className={css.navigation}>
                <StoreSelector
                    integrations={storeIntegrations}
                    selected={selectedStoreIntegration}
                    onChange={handleStoreChange}
                    shouldShowActiveStatus={shouldShowActiveStatus}
                    enableDynamicHeight
                    fullWidth
                    singleStoreInline
                    buttonClassName={css.storeSelectorButton}
                    hideSelectedFromDropdown
                    applyClassicThemeOverride
                />
                <Navigation.SectionItem
                    as={NavLink}
                    to={`/app/ai-journey/${shopName}`}
                >
                    Overview
                </Navigation.SectionItem>
            </Navigation.Root>
        </Navbar>
    )
}
