import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { getCheapestPlanNameForFeature } from '@repo/billing'
import { useTitle } from '@repo/hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSearch } from 'hooks/useSearch'
import type { AutomatePlan, HelpdeskPlan } from 'models/billing/types'
import { fetchApps } from 'models/integration/resources'
import type { AppListItem, Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import {
    Category as CategoryType,
    isCategory,
} from 'models/integration/types/app'
import PageHeader from 'pages/common/components/PageHeader'
import {
    getAvailableAutomatePlans,
    getAvailableHelpdeskPlans,
    getCurrentProductsFeatures,
} from 'state/billing/selectors'
import type {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'
import { fetchIntegrations } from 'state/integrations/actions'
import {
    getIntegrations,
    getIntegrationsByTypes,
    getIntegrationsList,
} from 'state/integrations/selectors'
import type { IntegrationListItem } from 'state/integrations/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import Card from './Card'
import CardsWrapper from './CardsWrapper'
import Category from './Category'
import CategoryFilter from './CategoryFilter'
import {
    CATEGORY_DATA,
    CATEGORY_URL_PARAM,
    MAX_CARDS_DISPLAYED,
    ORDERED_CATEGORIES,
    SEARCH_URL_PARAM,
} from './constants'
import { filterOutDeprecatedIntegrations } from './filters'
import LimitWarning from './LimitWarning'
import Loader from './Loader'
import RequestApp from './RequestApp'
import Search from './Search'

import css from './All.less'

type Item = IntegrationListItem

export function addRequiredPlanToIntegrations(
    integrationsListItems: IntegrationListItem[],
    integrations: Integration[],
    features: Partial<Record<AccountFeature, AccountFeatureMetadata>>,
    plans: (HelpdeskPlan | AutomatePlan)[],
) {
    return integrationsListItems.map((integration) => {
        const requiredFeature = integration.requiredFeature

        if (!requiredFeature) return integration
        if (features[requiredFeature]?.enabled) return integration

        const requiredPriceName = getCheapestPlanNameForFeature(
            requiredFeature,
            plans,
        )
        return {
            ...integration,
            requiredPriceName,
        }
    })
}

export default function All() {
    useTitle('All apps')
    const dispatch = useAppDispatch()

    const integrations = useAppSelector(getIntegrations)
    const integrationsList = useAppSelector(getIntegrationsList)
    const features = useAppSelector(getCurrentProductsFeatures)
    const automateAvailablePlans = useAppSelector(getAvailableAutomatePlans)
    const helpdeskAvailablePlans = useAppSelector(getAvailableHelpdeskPlans)

    const availablePlans = [
        ...automateAvailablePlans,
        ...helpdeskAvailablePlans,
    ]

    const search = useSearch<{
        [SEARCH_URL_PARAM]: string
        [CATEGORY_URL_PARAM]: string
    }>()
    const activeSearch = search[SEARCH_URL_PARAM]
    const categoryParam = search[CATEGORY_URL_PARAM]
    const activeCategory = isCategory(categoryParam) ? categoryParam : undefined

    const [isLoading, setLoading] = useState(true)
    const [apps, setApps] = useState<AppListItem[]>([])

    const appIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.App,
            IntegrationType.Ecommerce,
        ]),
    )

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
                    }),
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

    const filteredIntegrationsList = filterOutDeprecatedIntegrations(
        integrationsList,
        integrations,
    )

    const integrationApps: IntegrationListItem[] = apps.map((app) => {
        const count = appIntegrations.filter(
            (integration) => integration.application_id === app.appId,
        ).length
        return {
            ...app,
            count,
        }
    })

    const items: Item[] = [
        ...addRequiredPlanToIntegrations(
            filteredIntegrationsList,
            integrations,
            features,
            availablePlans,
        ),
        ...integrationApps,
    ]

    const hasFilter = activeSearch || activeCategory
    const cardsByCategory = {} as Record<Partial<CategoryType>, ReactNode[]>
    const filteredCards: ReactNode[] = []

    if (hasFilter) {
        items.forEach((item) => {
            const matchSearch = Boolean(
                activeSearch && item.title.toLowerCase().includes(activeSearch),
            )
            const matchCategory = Boolean(
                activeCategory && item.categories.includes(activeCategory),
            )
            if (
                (!activeCategory && matchSearch) ||
                (!activeSearch && matchCategory) ||
                (matchSearch && matchCategory)
            ) {
                filteredCards.push(
                    <Card
                        key={item.title}
                        item={item}
                        isFeatured={
                            item.categories.includes(CategoryType.FEATURED) &&
                            activeCategory !== CategoryType.FEATURED
                        }
                    />,
                )
            }
        })
    } else {
        items.forEach((item) => {
            item.categories.forEach((category) => {
                if (typeof cardsByCategory[category] === 'undefined') {
                    cardsByCategory[category] = []
                }
                if (cardsByCategory[category].length < MAX_CARDS_DISPLAYED) {
                    cardsByCategory[category].push(
                        buildCardWithDisplayClasses(
                            item,
                            cardsByCategory[category].length,
                            category,
                        ),
                    )
                }
            })
        })
    }

    return (
        <main className="full-width">
            <PageHeader title="All apps">
                <Search />
            </PageHeader>
            <div className={css.container}>
                <CategoryFilter />
                <div className={css.cardContainer}>
                    <LimitWarning className={css.spacer} />

                    {!activeSearch && activeCategory && (
                        <>
                            <CardsWrapper
                                header={<Category category={activeCategory} />}
                            >
                                {filteredCards}
                            </CardsWrapper>
                            {!isLoading && filteredCards.length === 0 && (
                                <p className={css.noApps}>
                                    They are no apps in this category yet.
                                </p>
                            )}
                        </>
                    )}
                    {activeSearch && (
                        <CardsWrapper
                            header={
                                <SearchLabel
                                    activeSearch={activeSearch}
                                    activeCategory={activeCategory}
                                    hasResults={Boolean(filteredCards.length)}
                                />
                            }
                        >
                            {filteredCards}
                        </CardsWrapper>
                    )}

                    {hasFilter && isLoading && <Loader />}

                    {!hasFilter &&
                        ORDERED_CATEGORIES.filter(
                            (category) => category in cardsByCategory,
                        ).map((category) => {
                            let cards = cardsByCategory[category]
                            if (isLoading) cards = fillGap(cards)

                            return (
                                <CardsWrapper
                                    key={category}
                                    header={
                                        <Category
                                            category={category}
                                            showCategoryLink
                                        />
                                    }
                                >
                                    {cards}
                                </CardsWrapper>
                            )
                        })}
                    <RequestApp />
                </div>
            </div>
        </main>
    )
}

function fillGap(cards: ReactNode[]) {
    const newCards = [...cards]
    for (let index = newCards.length; index < MAX_CARDS_DISPLAYED; index++) {
        newCards.push(buildCardWithDisplayClasses(null, index))
    }
    return newCards
}

function buildCardWithDisplayClasses(
    item: Item | null,
    index: number,
    category?: CategoryType,
) {
    let additionalClasses = ''
    if (index > 0) additionalClasses += css.showDesktop + ' '
    if (index > 1) additionalClasses += css.showLargeDesktop + ' '
    if (index > 2) additionalClasses += css.showXLargeDesktop + ' '
    if (index > 3) additionalClasses += css.showXXLargeDesktop + ' '

    if (!item)
        return <Card isLoading className={additionalClasses} key={index} />

    const isFeatured = item.categories.includes(CategoryType.FEATURED)

    return (
        <Card
            key={item.title}
            item={item}
            className={additionalClasses}
            isFeatured={isFeatured}
            hasNoFeaturedPill={category === CategoryType.FEATURED}
        />
    )
}

function SearchLabel({
    activeSearch,
    activeCategory,
    hasResults,
}: {
    activeSearch: string
    activeCategory: CategoryType | undefined
    hasResults: boolean
}) {
    return (
        <h2 className={css.searchLabel}>
            {hasResults ? 'Results for' : '0 results for'}{' '}
            <span className={css.searchBold}>“{activeSearch}”</span>
            {activeCategory ? (
                <>
                    {' '}
                    in category{' '}
                    <span className={css.searchBold}>
                        {CATEGORY_DATA[activeCategory].title}
                    </span>
                </>
            ) : null}
        </h2>
    )
}
