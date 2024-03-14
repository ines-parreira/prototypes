import React, {Dispatch, SetStateAction, useMemo, useRef} from 'react'
import {Link} from 'react-router-dom'

import {
    AIArticleToggleOptionValue,
    AILibraryArticleItem,
} from 'models/helpCenter/types'

import Button from 'pages/common/components/button/Button'
import useKey from 'hooks/useKey'
import useEffectOnce from 'hooks/useEffectOnce'
import AIArticleRow from '../AIArticleRow/AIArticleRow'
import AIArticlesToggleButton from '../AIArticlesToggleButton'
import {AI_ARTICLES_TOGGLE_OPTIONS} from '../../constants'

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
    showLinkToArticleTemplates: boolean
}

const AIArticlesLibraryList = ({
    helpCenterId,
    articles,
    counters,
    selectedArticle,
    setSelectedArticle,
    selectedArticleType,
    setSelectedArticleType,
    showLinkToArticleTemplates,
}: AIArticlesLibraryListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

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
            {showLinkToArticleTemplates ? (
                <div className={css.centeredMessage}>
                    <div className={css.messageContainer}>
                        <div className={css.message}>
                            We don't have any recommended articles for your Help
                            Center yet.
                        </div>
                        <Link
                            to={`/app/settings/help-center/${helpCenterId}/articles`}
                        >
                            Get started with an article template
                        </Link>
                    </div>
                </div>
            ) : showArticlesList ? (
                <>
                    {counters &&
                        counters[AIArticleToggleOptionValue.Old] > 0 && (
                            <AIArticlesToggleButton
                                selectedOption={selectedArticleType}
                                setSelectedOption={setSelectedArticleType}
                                options={toggleOptions}
                            />
                        )}
                    <div className={css.listHeader}>
                        <div>Generated Article</div>
                        <div># of ticket inquiries</div>
                    </div>
                    {!articles || articles.length === 0 ? (
                        <div className={css.centeredMessage}>
                            <div className={css.messageContainer}>
                                <div className={css.message}>
                                    {selectedArticleType ===
                                    AIArticleToggleOptionValue.New
                                        ? "You've reviewed all new article suggestions."
                                        : "You've reviewed all past article suggestions."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={css.articlesList}>
                            {articles?.map((article) => (
                                <AIArticleRow
                                    key={article.key}
                                    article={article}
                                    isSelected={
                                        article.key === selectedArticle?.key
                                    }
                                    onSelect={setSelectedArticle}
                                    showNewTag={
                                        selectedArticleType ===
                                        AIArticleToggleOptionValue.All
                                    }
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <AIArticlesLibraryListReviewedState />
            )}
        </div>
    )
}

export default AIArticlesLibraryList
