import React, {Dispatch, SetStateAction} from 'react'
import classNames from 'classnames'

import {AILibraryArticleItem} from 'models/helpCenter/types'

import css from './AIArticleRow.less'

export type AIArticleRowProps = {
    article: AILibraryArticleItem
    isSelected: boolean
    onSelect: Dispatch<SetStateAction<AILibraryArticleItem | undefined>>
    showNewTag: boolean
}

const AIArticleRow = ({
    article,
    isSelected,
    onSelect,
    showNewTag,
}: AIArticleRowProps) => {
    const showCount =
        article.related_tickets_count && article.related_tickets_count > 0
    return (
        <div
            className={classNames(css.container, {
                [css.active]: isSelected,
            })}
            onClick={() => onSelect(article)}
            data-testid="ai-article-row"
        >
            <div className={css.titleContainer}>
                <i className="material-icons rounded">article</i>
                <div className={css.title}>{article.title}</div>
                {showNewTag && article.isNew && (
                    <div className={css.new}>new</div>
                )}
            </div>
            <div>{showCount && article.related_tickets_count}</div>
        </div>
    )
}

export default AIArticleRow
