import React from 'react'

import {HelpCenterArticle} from '../../../../../models/helpCenter/types'
import {ArticlesTable} from '../ArticlesTable'

import css from './HelpCenterArticleList.less'

type Props = {
    label: string
    list: HelpCenterArticle[]
    onClick: (article: HelpCenterArticle) => void
    onClickSettings: (action: string, article: HelpCenterArticle) => void
    onReorderFinish?: (
        categoryId: number,
        articles: HelpCenterArticle[]
    ) => void
}

export const HelpCenterArticleList = ({
    label,
    list,
    onClick,
    onClickSettings,
    onReorderFinish,
}: Props) => {
    return (
        <div className={css.wrapper}>
            <h6 className={css.label}>{label}</h6>
            <ArticlesTable
                isNested={false}
                categoryId={-1}
                list={list}
                onClick={onClick}
                onClickSettings={onClickSettings}
                onReorderFinish={onReorderFinish}
            />
        </div>
    )
}

export default HelpCenterArticleList
