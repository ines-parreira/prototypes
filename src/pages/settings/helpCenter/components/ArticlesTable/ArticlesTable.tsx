import React, {useEffect, useState} from 'react'
import classNames from 'classnames'
import {chain as _chain} from 'lodash'
import _sortBy from 'lodash/sortBy'

import {Article} from 'models/helpCenter/types'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {ArticleRowActionTypes} from '../../constants'

import {ArticleRow} from './components/ArticleRow'

import css from './ArticlesTable.less'

type Props = {
    isNested?: boolean
    categoryId: number | null
    level: number
    articles: Article[]
    onClick: (article: Article) => void
    onClickSettings: (name: ArticleRowActionTypes, article: Article) => void
    onReorderFinish?: (categoryId: number | null, articles: Article[]) => void
}

export const ArticlesTable = ({
    isNested = false,
    categoryId,
    level,
    articles,
    onClick,
    onClickSettings,
    onReorderFinish,
}: Props): JSX.Element => {
    const [records, setRecords] = useState(() =>
        _sortBy(articles, ['position'])
    )

    useEffect(() => {
        setRecords(_sortBy(articles, ['position']))
    }, [articles])

    const handleOnClickRow = (article: Article) => {
        onClick(article)
    }
    const handleOnClickSettings = (
        event: React.MouseEvent,
        name: ArticleRowActionTypes,
        article: Article
    ) => {
        event.stopPropagation()

        onClickSettings(name, article)
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
                <HeaderCell style={{width: 160}} />
            </TableHead>
            <TableBody>
                {records.map((article, index) => (
                    <ArticleRow
                        key={article.id}
                        isNested={isNested}
                        level={level}
                        categoryId={categoryId}
                        article={article}
                        position={index}
                        onMoveEntity={handleOnMoveArticle}
                        onDropEntity={handleOnReorderFinish}
                        onClickRow={handleOnClickRow}
                        onClickSettings={handleOnClickSettings}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
