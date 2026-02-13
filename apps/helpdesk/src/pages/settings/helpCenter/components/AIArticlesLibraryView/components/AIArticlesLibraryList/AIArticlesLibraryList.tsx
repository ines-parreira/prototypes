import type { Dispatch, SetStateAction } from 'react'
import { useMemo, useRef } from 'react'

import { useEffectOnce, useKey } from '@repo/hooks'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { AILibraryArticleItem } from 'models/helpCenter/types'
import { AIArticleToggleOptionValue } from 'models/helpCenter/types'

import { AI_ARTICLES_TOGGLE_OPTIONS } from '../../constants'
import AIArticleLibraryRedirect from './AIArticleLibraryRedirect'
import AIArticleList from './AIArticleList'
import AIArticlesLibraryListReviewedState from './AIArticlesLibraryListReviewedState'

import css from './AIArticlesLibraryList.less'

type AIArticlesLibraryListProps = {
    helpCenterId: number
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
    hasStoreConnection: boolean
    showLinkToConnectEmailToStore: boolean
}

const AIArticlesLibraryList = ({
    helpCenterId,
    articles,
    counters,
    selectedArticle,
    setSelectedArticle,
    selectedArticleType,
    setSelectedArticleType,
    hasStoreConnection,
    showLinkToConnectEmailToStore,
}: AIArticlesLibraryListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const showArticlesList = useMemo(
        () => !counters || counters[AIArticleToggleOptionValue.All] > 0,
        [counters],
    )

    const toggleOptions = AI_ARTICLES_TOGGLE_OPTIONS.map((option) => {
        const { value } = option
        const count = counters?.[value] || 0

        return {
            ...option,
            count,
        }
    })

    const [previousArticle, nextArticle] = useMemo(() => {
        const currentIndex = articles?.findIndex(
            (article) => article.key === selectedArticle?.key,
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
        { target: containerRef.current },
        [nextArticle, setSelectedArticle],
    )

    useKey(
        'ArrowUp',
        (e) => {
            e.preventDefault()
            setSelectedArticle(previousArticle)
        },
        { target: containerRef.current },
        [previousArticle, setSelectedArticle],
    )

    useEffectOnce(() => {
        containerRef.current?.focus()
    })

    return (
        <div className={css.container} ref={containerRef} tabIndex={1}>
            <h3>AI Generated Articles</h3>
            <div className={css.description}>
                {`Review, edit, and publish pre-written articles based on your
                customers' top asked questions. New articles are generated every
                90 days.`}
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
            {!hasStoreConnection ? (
                <AIArticleLibraryRedirect
                    message="To generate articles with AI, connect your Help Center to a store. This helps the AI know which customer questions correspond with this Help Center."
                    linkAddress={`/app/settings/help-center/${helpCenterId}/publish-track`}
                    linkDescription="Connect Help Center to store"
                />
            ) : showLinkToConnectEmailToStore ? (
                <AIArticleLibraryRedirect
                    message="To generate articles with AI, connect your email and
                            store integrations. This helps the AI know which
                            customer questions correspond with this Help Center."
                    linkAddress={`/app/settings/channels/email`}
                    linkDescription="Connect store to email"
                    openNewTab
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
