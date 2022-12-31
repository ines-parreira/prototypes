import React, {ReactNode, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {getCheapestPriceNameForFeature} from 'utils/paywalls'
import {fetchApps} from 'models/integration/resources'
import {Integration, IntegrationType} from 'models/integration/types'
import {
    AppListItem,
    Category as CategoryType,
    isCategory,
} from 'models/integration/types/app'
import {AutomationPrice, HelpdeskPrice} from 'models/billing/types'
import {fetchIntegrations} from 'state/integrations/actions'
import {IntegrationListItem} from 'state/integrations/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    getAutomationPrices,
    getHelpdeskPrices,
    getCurrentProductsFeatures,
} from 'state/billing/selectors'
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

import Spinner from 'pages/common/components/Spinner/Spinner'
import {
    ORDERED_CATEGORIES,
    MAX_CARDS_DISPLAYED,
    CATEGORY_URL_PARAM,
} from './constants'
import css from './All.less'
import CategoryFilter from './CategoryFilter'
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

        let requiredPriceName = getCheapestPriceNameForFeature(
            requiredFeature,
            prices
        )
        // `prices` variable doesn't contain the custom plans and the
        // most similar plan would be the enterprise one
        if (
            !hasTwitterIntegrations(integrations) &&
            integration.type === IntegrationType.Twitter
        ) {
            requiredPriceName = 'Enterprise'
        }
        return {
            ...integration,
            requiredPriceName,
        }
    })
}

export default function All() {
    const dispatch = useAppDispatch()

    const integrations = useAppSelector(getIntegrations)
    const integrationsList = useAppSelector(getIntegrationsList)
    const features = useAppSelector(getCurrentProductsFeatures)
    const automationPrices = useAppSelector(getAutomationPrices)
    const helpdeskPrices = useAppSelector(getHelpdeskPrices)

    const prices = [...automationPrices, ...helpdeskPrices]

    const {search} = useLocation()
    const catagoryUrlParam = new URLSearchParams(search).get(CATEGORY_URL_PARAM)
    const activeCategory = isCategory(catagoryUrlParam)
        ? catagoryUrlParam
        : null
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
            <div className={css.container}>
                <CategoryFilter />
                <div className={css.cardContainer}>
                    <LimitWarning className={css.spacer} />
                    {activeCategory ? (
                        <>
                            <Category category={activeCategory}>
                                {itemsByCategory[activeCategory]?.map(
                                    (item, index) => (
                                        <Card
                                            key={`${index}-${item.title}`}
                                            item={item}
                                            isFeatured={item.categories.includes(
                                                CategoryType.FEATURED
                                            )}
                                            hasNoFeaturedPill={
                                                activeCategory ===
                                                CategoryType.FEATURED
                                            }
                                        />
                                    )
                                )}
                            </Category>
                            {!isLoading && !itemsByCategory[activeCategory] && (
                                <p className={css.noApps}>
                                    They are no apps in this category yet.
                                </p>
                            )}
                            {isLoading && (
                                <p className={`${css.spinnerWrapper}`}>
                                    <Spinner
                                        className={css.spinner}
                                        color="gloom"
                                    />
                                    Loading more Apps
                                </p>
                            )}
                        </>
                    ) : (
                        ORDERED_CATEGORIES.filter(
                            (category) => category in itemsByCategory
                        ).map((category) => {
                            return (
                                <Category
                                    key={category}
                                    category={category}
                                    showCategoryLink
                                >
                                    {buildUnfilteredCards(
                                        category,
                                        itemsByCategory[category],
                                        isLoading
                                    )}
                                </Category>
                            )
                        })
                    )}

                    {!isLoading && <RequestApp />}
                </div>
            </div>
        </main>
    )
}

function buildUnfilteredCards(
    category: CategoryType,
    items: Item[],
    isLoading: boolean
) {
    const cards: ReactNode[] = items
        .slice(0, MAX_CARDS_DISPLAYED)
        .map((item, index) => buildUnfilteredCard(item, category, index))

    if (isLoading) {
        for (let index = cards.length; index < MAX_CARDS_DISPLAYED; index++) {
            cards.push(buildUnfilteredCard(null, category, index))
        }
    }
    return cards
}

function buildUnfilteredCard(
    item: Item | null,
    category: CategoryType,
    index: number
) {
    let additionalClasses = ''
    if (index > 0) additionalClasses += css.showDesktop + ' '
    if (index > 1) additionalClasses += css.showLargeDesktop + ' '
    if (index > 2) additionalClasses += css.showXLargeDesktop + ' '
    if (index > 3) additionalClasses += css.showXXLargeDesktop + ' '

    if (!item) return <Card isLoading className={additionalClasses} />

    const isFeatured = item.categories.includes(CategoryType.FEATURED)

    return (
        <Card
            key={`${category}-${item.title}`}
            item={item}
            className={additionalClasses}
            isFeatured={isFeatured}
            hasNoFeaturedPill={category === CategoryType.FEATURED}
        />
    )
}
