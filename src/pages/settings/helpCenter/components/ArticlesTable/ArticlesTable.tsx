import React from 'react'
import {chain} from 'lodash'
import classNames from 'classnames'

import {HelpCenterArticle} from '../../../../../models/helpCenter/types'

import TableWrapper from '../../../../common/components/table/TableWrapper'

import {ArticlesTableBody} from './components/ArticlesTableBody'

import css from './ArticlesTable.less'

type Props = {
    isNested?: boolean
    categoryId: number
    list: HelpCenterArticle[]
    onClick: (article: HelpCenterArticle) => void
    onClickSettings: (article: HelpCenterArticle) => void
}

export const ArticlesTable = ({
    isNested = false,
    categoryId,
    list,
    onClick,
    onClickSettings,
}: Props): JSX.Element => {
    const [records, setRecords] = React.useState(
        chain(list)
            .sortBy(['position'])
            .map((article: HelpCenterArticle, index) => {
                const draft = {...article}
                draft.position = index
                return draft
            })
            .value()
    )
    const handleOnClickRow = (article: HelpCenterArticle) => {
        onClick(article)
    }
    const handleOnClickSettings = (
        event: React.MouseEvent<HTMLButtonElement>,
        article: HelpCenterArticle
    ) => {
        event.stopPropagation()
        onClickSettings(article)
    }

    const handleOnMoveArticle = (dragIndex: number, hoverIndex: number) => {
        const dragRecord = records.find(
            (article) => article.position === dragIndex
        )
        const nextRecords = [...records]

        if (dragRecord) {
            nextRecords.splice(dragIndex, 1)
            nextRecords.splice(hoverIndex, 0, dragRecord)

            chain(nextRecords)
                .map((article: HelpCenterArticle, index: number) => {
                    article.position = index
                    return article
                })
                .sortBy('position')
                .value()

            setRecords(nextRecords)
        }
    }

    return (
        <TableWrapper
            className={classNames({
                [css['nested-table']]: isNested,
            })}
        >
            <ArticlesTableBody
                categoryId={categoryId}
                list={records}
                onMoveEntity={handleOnMoveArticle}
                onClickRow={handleOnClickRow}
                onClickSettings={handleOnClickSettings}
            />
        </TableWrapper>
    )
}
