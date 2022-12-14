import React, {useEffect, useState} from 'react'
import classNames from 'classnames'
import {chain as _chain} from 'lodash'
import _sortBy from 'lodash/sortBy'

import _noop from 'lodash/noop'
import {Article} from 'models/helpCenter/types'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {ArticleRowActionTypes} from '../../constants'

import {useAbilityChecker} from '../../hooks/useHelpCenterApi'
import {ArticleRow} from './components/ArticleRow'

import css from './ArticlesTable.less'

type Props = {
    isNested?: boolean
    categoryId: number | null
    level: number
    isAncestorUnlisted: boolean
    articles: Article[]
    onClick: (article: Article) => void
    onClickSettings: (
        name: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => void
    onReorderFinish?: (categoryId: number | null, articles: Article[]) => void
}

export const ArticlesTable = ({
    isNested = false,
    categoryId,
    level,
    isAncestorUnlisted,
    articles,
    onClick,
    onClickSettings,
    onReorderFinish,
}: Props): JSX.Element => {
    const [records, setRecords] = useState(() =>
        _sortBy(articles, ['position'])
    )
    const {isPassingRulesCheck} = useAbilityChecker()

    useEffect(() => {
        setRecords(_sortBy(articles, ['position']))
    }, [articles])

    const handleOnClickRow = (article: Article) => {
        onClick(article)
    }
    const handleOnClickSettings = (
        event: React.MouseEvent,
        name: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => {
        event.stopPropagation()

        onClickSettings(name, article, isArticleOrAncestorUnlisted)
    }

    const handleOnMoveArticle = (dragIndex: number, hoverIndex: number) => {
        const dragRecord = records[dragIndex]
        let nextRecords = [...records]

        if (dragRecord) {
            nextRecords.splice(dragIndex, 1)
            nextRecords.splice(hoverIndex, 0, dragRecord)

            nextRecords = _chain(nextRecords)
                .map((article: Article, index: number) => ({
                    ...article,
                    position: index,
                }))
                .sortBy('position')
                .value()

            setRecords(nextRecords)
        }
    }

    const handleOnReorderFinish = () => {
        onReorderFinish?.(categoryId, records)
    }

    const canUpdateArticle = isPassingRulesCheck(({can}) =>
        can('update', 'ArticleEntity')
    )

    return (
        <TableWrapper
            className={classNames({
                [css['nested-table']]: isNested,
            })}
        >
            <TableHead className={css['header-tr']}>
                <HeaderCell style={{width: 25}} />
                <HeaderCell />
                <HeaderCell style={{width: 124}} />
                <HeaderCell style={{width: 131}} />
                <HeaderCell style={{width: 160}} />
            </TableHead>
            <TableBody>
                {records.map((article, index) => (
                    <ArticleRow
                        key={article.id}
                        isNested={isNested}
                        level={level}
                        isAncestorUnlisted={isAncestorUnlisted}
                        categoryId={categoryId}
                        article={article}
                        position={index}
                        onMoveEntity={
                            canUpdateArticle ? handleOnMoveArticle : _noop
                        }
                        onDropEntity={
                            canUpdateArticle ? handleOnReorderFinish : _noop
                        }
                        onClickRow={handleOnClickRow}
                        onClickSettings={handleOnClickSettings}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
