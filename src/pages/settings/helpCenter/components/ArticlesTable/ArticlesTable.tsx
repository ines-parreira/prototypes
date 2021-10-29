import React from 'react'
import {chain as _chain} from 'lodash'
import _sortBy from 'lodash/sortBy'
import classNames from 'classnames'

import {Article} from '../../../../../models/helpCenter/types'
import HeaderCell from '../../../../common/components/table/cells/HeaderCell'
import TableHead from '../../../../common/components/table/TableHead'

import TableWrapper from '../../../../common/components/table/TableWrapper'

import {ArticlesTableBody} from './components/ArticlesTableBody'

import css from './ArticlesTable.less'

type Props = {
    isNested?: boolean
    categoryId: number
    list: Article[]
    onClick: (article: Article) => void
    onClickSettings: (name: string, article: Article) => void
    onReorderFinish?: (categoryId: number, articles: Article[]) => void
}

export const ArticlesTable = ({
    isNested = false,
    categoryId,
    list,
    onClick,
    onClickSettings,
    onReorderFinish,
}: Props): JSX.Element => {
    const [records, setRecords] = React.useState(_sortBy(list, ['position']))

    React.useEffect(() => {
        setRecords(_sortBy(list, ['position']))
    }, [list])

    const handleOnClickRow = (article: Article) => {
        onClick(article)
    }
    const handleOnClickSettings = (
        event: React.MouseEvent,
        name: string,
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
            <ArticlesTableBody
                isNested={isNested}
                categoryId={categoryId}
                list={records}
                onMoveEntity={handleOnMoveArticle}
                onClickRow={handleOnClickRow}
                onClickSettings={handleOnClickSettings}
                onDropEntity={handleOnReorderFinish}
            />
        </TableWrapper>
    )
}
