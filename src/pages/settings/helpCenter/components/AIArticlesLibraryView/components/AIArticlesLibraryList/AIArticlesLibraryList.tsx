import React, {Dispatch, SetStateAction, useMemo, useRef} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    AIArticleToggleOptionValue,
    AILibraryArticleItem,
} from 'models/helpCenter/types'

import * as integrationsSelectors from 'state/integrations/selectors'
import Button from 'pages/common/components/button/Button'
import useKey from 'hooks/useKey'
import useEffectOnce from 'hooks/useEffectOnce'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {FeatureFlagKey} from 'config/featureFlags'

import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import {isGenericEmailIntegration} from 'pages/integrations/integration/components/email/helpers'
import {useSelfServiceStoreIntegrationByShopName} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {useListStoreMappings} from 'models/storeMapping/queries'
import {StoreMapping} from 'models/storeMapping/types'
import {AI_ARTICLES_TOGGLE_OPTIONS} from '../../constants'
import AIArticlesLibraryListReviewedState from './AIArticlesLibraryListReviewedState'

import css from './AIArticlesLibraryList.less'
import AIArticleLibraryRedirect from './AIArticleLibraryRedirect'
import AIArticleList from './AIArticleList'

type AIArticlesLibraryListProps = {
    helpCenterId: number
    helpCenterShopName: string | null
    articles?: AILibraryArticleItem[] | null
    counters: {
        [AIArticleToggleOptionValue.New]: number
        [AIArticleToggleOptionValue.Old]: number
        [AIArticleToggleOptionValue.All]: number
    } | null
    selectedArticle?: AILibraryArticleItem
    setSelectedArticle: Dispatch<
        SetStateAction<AILibraryArticleItem | undefined>
    >
    selectedArticleType: AIArticleToggleOptionValue
    setSelectedArticleType: Dispatch<SetStateAction<AIArticleToggleOptionValue>>
    showLinkToArticleTemplates: boolean
}

const AIArticlesLibraryList = ({
    helpCenterId,
    helpCenterShopName,
    articles,
    counters,
    selectedArticle,
    setSelectedArticle,
    selectedArticleType,
    setSelectedArticleType,
    showLinkToArticleTemplates,
}: AIArticlesLibraryListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const isAIArticlesForMultiStoreEnabled: boolean | undefined =
        useFlags()[
            FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore
        ]

    const shopifyIntegrations = useShopifyIntegrations()
    const hasMultiBrands = shopifyIntegrations.length > 1

    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    )
    const emailIntegrations = integrations.filter(isGenericEmailIntegration)
    const emailIntegrationIds = emailIntegrations.map(
        (emailIntegration) => emailIntegration.id
    )
    const {data: storeMapping} = useListStoreMappings(emailIntegrationIds, {
        refetchOnWindowFocus: false,
    })
    const storeIntegration = useSelfServiceStoreIntegrationByShopName(
        helpCenterShopName ?? ''
    )
    const hasEmailToStoreConnection = storeMapping?.some(
        (mapping: StoreMapping) => mapping.store_id === storeIntegration?.id
    )

    const showLinkToConnectEmailToStore = useMemo(
        () =>
            isAIArticlesForMultiStoreEnabled &&
            hasMultiBrands &&
            !hasEmailToStoreConnection,
        [
            isAIArticlesForMultiStoreEnabled,
            hasMultiBrands,
            hasEmailToStoreConnection,
        ]
    )

    const showArticlesList = useMemo(
        () =>
            (!counters || counters[AIArticleToggleOptionValue.All] > 0) &&
            !showLinkToArticleTemplates,
        [counters, showLinkToArticleTemplates]
    )

    const toggleOptions = AI_ARTICLES_TOGGLE_OPTIONS.map((option) => {
        const {value} = option
        const count = counters?.[value] || 0

        return {
            ...option,
            count,
        }
    })

    const [previousArticle, nextArticle] = useMemo(() => {
        const currentIndex = articles?.findIndex(
            (article) => article.key === selectedArticle?.key
        )
        if (currentIndex !== undefined && currentIndex !== null && articles) {
            const prevIndex =
                currentIndex === 0 ? articles.length - 1 : currentIndex - 1
            const nextIndex =
                currentIndex === articles.length - 1 ? 0 : currentIndex + 1
            return [articles[prevIndex], articles[nextIndex]]
        }

        return [articles?.[articles.length - 1], articles?.[0]]
    }, [articles, selectedArticle])

    useKey(
        'ArrowDown',
        (e) => {
            e.preventDefault()
            setSelectedArticle(nextArticle)
        },
        {target: containerRef.current},
        [nextArticle, setSelectedArticle]
    )

    useKey(
        'ArrowUp',
        (e) => {
            e.preventDefault()
            setSelectedArticle(previousArticle)
        },
        {target: containerRef.current},
        [previousArticle, setSelectedArticle]
    )

    useEffectOnce(() => {
        containerRef.current?.focus()
    })

    return (
        <div className={css.container} ref={containerRef} tabIndex={1}>
            <h3>AI Generated Articles</h3>
            <div className={css.description}>
                Review, edit, and publish pre-written articles based on your
                customers' top asked questions. New articles are generated every
                90 days.
            </div>
            <a
                className={css.articleLink}
                href="https://docs.gorgias.com/en-US/422031-01b2bf287f8e4447add54794e89c3e8a"
                rel="noopener noreferrer"
                target="_blank"
            >
                <Button fillStyle="ghost">
                    <i className="material-icons rounded">menu_book</i>
                    How articles are generated with AI
                </Button>
            </a>
            {showLinkToConnectEmailToStore ? (
                <AIArticleLibraryRedirect
                    message="To generate articles with AI, connect your email and
                            store integrations. This helps the AI know which
                            customer questions correspond with this Help Center."
                    linkAddress={`/app/settings/channels/email`}
                    linkDescription="Connect store"
                    openNewTab
                />
            ) : showLinkToArticleTemplates ? (
                <AIArticleLibraryRedirect
                    message="We don't have any recommended articles for your Help
                            Center yet. Check back next Monday to review newly
                            generated articles."
                    linkAddress={`/app/settings/help-center/${helpCenterId}/articles`}
                    linkDescription="Get started with an article template"
                />
            ) : showArticlesList ? (
                <AIArticleList
                    articles={articles}
                    counters={counters}
                    selectedArticle={selectedArticle}
                    setSelectedArticle={setSelectedArticle}
                    selectedArticleType={selectedArticleType}
                    setSelectedArticleType={setSelectedArticleType}
                    toggleOptions={toggleOptions}
                />
            ) : (
                <AIArticlesLibraryListReviewedState />
            )}
        </div>
    )
}

export default AIArticlesLibraryList
