import type { Dispatch, SetStateAction } from 'react'
import React from 'react'

import type {
    AIArticleToggleOption,
    AILibraryArticleItem,
} from 'models/helpCenter/types'
import { AIArticleToggleOptionValue } from 'models/helpCenter/types'

import AIArticleRow from '../AIArticleRow/AIArticleRow'
import AIArticlesToggleButton from '../AIArticlesToggleButton'

import css from './AIArticlesLibraryList.less'

type AIArticleListProps = {
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
    toggleOptions: (AIArticleToggleOption & { count: number })[]
}

const AIArticlesList = ({
    counters,
    articles,
    selectedArticleType,
    setSelectedArticleType,
    selectedArticle,
    setSelectedArticle,
    toggleOptions,
}: AIArticleListProps) => (
    <>
        {counters && counters[AIArticleToggleOptionValue.Old] > 0 && (
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
                        {selectedArticleType === AIArticleToggleOptionValue.New
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
                        isSelected={article.key === selectedArticle?.key}
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
)

export default AIArticlesList
