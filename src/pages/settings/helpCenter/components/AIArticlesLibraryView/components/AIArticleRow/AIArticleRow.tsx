import React, {Dispatch, SetStateAction} from 'react'
import classNames from 'classnames'

import {AIArticle} from 'models/helpCenter/types'

import css from './AIArticleRow.less'

export type AIArticleRowProps = {
    article: AIArticle
    isNew: boolean
    isActive: boolean
    onSelect: Dispatch<SetStateAction<AIArticle>>
}

const AIArticleRow = ({
    article,
    isNew,
    isActive,
    onSelect,
}: AIArticleRowProps) => {
    return (
        <div
            className={classNames(css.container, {
                [css.active]: isActive,
            })}
            onClick={() => onSelect(article)}
            data-testid="ai-article-row"
        >
            <div className={css.titleContainer}>
                <i className="material-icons rounded">article</i>
                <div className={css.title}>{article.title}</div>
                {isNew && <div className={css.new}>new</div>}
            </div>
            <div>{article.related_tickets_count || 225}</div>
        </div>
    )
}

export default AIArticleRow
