import React, {ReactNode, useEffect, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {getCheapestPriceNameForFeature} from 'utils/paywalls'
import {fetchApps} from 'models/integration/resources'
import {Integration, IntegrationType} from 'models/integration/types'
import {
    AppListItem,
    Category as CategoryType,
} from 'models/integration/types/app'
import {AutomationPrice, HelpdeskPrice} from 'models/billing/types'
import {fetchIntegrations} from 'state/integrations/actions'
import {IntegrationListItem} from 'state/integrations/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getPrices, getCurrentProductsFeatures} from 'state/billing/selectors'
import {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'
import {
    getIntegrations,
    getIntegrationsList,
} from 'state/integrations/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import cssLayout from 'pages/settings/settings.less'

import {ORDERED_CATEGORIES, MAX_CARDS_DISPLAYED} from './constants'
import css from './All.less'
import LimitWarning from './LimitWarning'
import Category from './Category'
import Card from './Card'
import RequestApp from './RequestApp'

type Item = IntegrationListItem | AppListItem

function hasTwitterIntegrations(integrations: Integration[]) {
    return integrations.some(
        (integration) =>
            integration.type === IntegrationType.Twitter &&
            integration.deleted_datetime === null
    )
}

export function addRequiredPlanToIntegrations(
    integrationsListItems: IntegrationListItem[],
    integrations: Integration[],
    features: Partial<Record<AccountFeature, AccountFeatureMetadata>>,
    prices: (HelpdeskPrice | AutomationPrice)[]
) {
    return integrationsListItems.map((integration) => {
        const requiredFeature = integration.requiredFeature

        if (!requiredFeature) return integration
        if (features[requiredFeature]?.enabled) return integration

        let requiredPlanName = getCheapestPriceNameForFeature(
            requiredFeature,
            prices
        )
        // `prices` variable doesn't contain the custom plans and the
        // most similar plan would be the enterprise one
        if (
            !hasTwitterIntegrations(integrations) &&
            integration.type === IntegrationType.Twitter
        ) {
            requiredPlanName = 'Enterprise'
        }
        return {
            ...integration,
            requiredPlanName,
        }
    })
}

export default function All() {
    const dispatch = useAppDispatch()

    const integrations = useAppSelector(getIntegrations)
    const integrationsList = useAppSelector(getIntegrationsList)
    const features = useAppSelector(getCurrentProductsFeatures)
    const prices = useAppSelector(getPrices)

    const [isLoading, setLoading] = useState(true)
    const [apps, setApps] = useState<AppListItem[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetchApps()
                setApps(res)
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Something went wrong while trying to fetch additional apps.`,
                    })
                )
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [dispatch])

    useEffect(() => {
        void dispatch(fetchIntegrations())
    }, [dispatch])

    const isAppStoreEnabled = useFlags()[FeatureFlagKey.AppStore]
    if (!isAppStoreEnabled) {
        return null
    }

    const items: Item[] = [
        ...addRequiredPlanToIntegrations(
            integrationsList,
            integrations,
            features,
            prices
        ),
        ...apps,
    ]

    const itemsByCategory = {} as Record<Partial<CategoryType>, typeof items>

    items.forEach((item) => {
        item.categories.forEach((category) => {
            if (typeof itemsByCategory[category] === 'undefined')
                itemsByCategory[category] = []
            itemsByCategory[category].push(item)
        })
    })

    return (
        <main className="full-width">
            <PageHeader title="All Apps" />
            <div className={cssLayout.pageContainer}>
                <LimitWarning className={css.spacer} />
                {ORDERED_CATEGORIES.map(({title, subtitle}) => {
                    if (typeof itemsByCategory[title] === 'undefined')
                        return null

                    return (
                        <Category key={title} title={title} subtitle={subtitle}>
                            {buildCards(
                                title,
                                itemsByCategory[title],
                                isLoading
                            )}
                        </Category>
                    )
                })}

                {!isLoading && <RequestApp />}
            </div>
        </main>
    )
}

function buildCards(
    categoryTitle: CategoryType,
    items: Item[],
    isLoading: boolean
) {
    const cards: ReactNode[] = items
        .slice(0, MAX_CARDS_DISPLAYED)
        .map((item, index) => buildCard(item, categoryTitle, index))

    if (isLoading) {
        for (let index = cards.length; index < MAX_CARDS_DISPLAYED; index++) {
            cards.push(buildCard(null, categoryTitle, index))
        }
    }
    return cards
}

function buildCard(
    item: Item | null,
    categoryTitle: CategoryType,
    index: number
) {
    if (!item) return <Card isLoading />

    let additionalClasses = ''
    if (index > 1) additionalClasses += css.showDesktop + ' '
    if (index > 2) additionalClasses += css.showLargeDesktop + ' '
    if (index > 3) additionalClasses += css.showXLargeDesktop
    const isFeatured = item.categories.includes(CategoryType.FEATURED)

    return (
        <Card
            key={`${categoryTitle}-${item.title}`}
            item={item}
            className={additionalClasses}
            isFeatured={isFeatured}
            hasNoFeaturedPill={categoryTitle === CategoryType.FEATURED}
        />
    )
}
