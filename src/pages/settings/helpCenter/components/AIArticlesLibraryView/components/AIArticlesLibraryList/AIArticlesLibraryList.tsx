import React, {Dispatch, SetStateAction, useMemo} from 'react'
import {Link} from 'react-router-dom'

import {
    AIArticleToggleOptionValue,
    AILibraryArticleItem,
} from 'models/helpCenter/types'

import Button from 'pages/common/components/button/Button'
import AIArticleRow from '../AIArticleRow/AIArticleRow'
import AIArticlesToggleButton from '../AIArticlesToggleButton'
import {AI_ARTICLES_TOGGLE_OPTIONS} from '../../constants'

import css from './AIArticlesLibraryList.less'

type AIArticlesLibraryListProps = {
    helpCenterId: number
    articles?: AILibraryArticleItem[] | null
    counters?: {
        [AIArticleToggleOptionValue.New]: number
        [AIArticleToggleOptionValue.Old]: number
        [AIArticleToggleOptionValue.All]: number
    }
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
    const showArticlesList = useMemo(
        () =>
            counters &&
            counters[AIArticleToggleOptionValue.All] > 0 &&
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

    return (
        <div className={css.container}>
            <h3>AI Generated Articles</h3>
            <div className={css.description}>
                Review, edit, and publish pre-written articles based on your
                customers' top asked questions. New articles are generated every
                90 days.
            </div>
            <Link to="#" className={css.articleLink}>
                <Button fillStyle="ghost">
                    <i className="material-icons rounded">menu_book</i>
                    How articles are generated with AI
                </Button>
            </Link>
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
                <div className={css.centeredMessage}>
                    <div className={css.messageContainer}>
                        <span
                            role="img"
                            aria-label="Hooray"
                            className={css.hooray}
                        >
                            🎉
                        </span>
                        <h3>Great work!</h3>
                        <div>You've reviewed every article.</div>
                        <div>
                            We'll notify you when new articles are generated.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AIArticlesLibraryList
