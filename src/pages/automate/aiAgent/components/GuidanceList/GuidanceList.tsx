import React, {useMemo, useState} from 'react'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {OrderDirection} from 'models/api/types'
import {DateAndTimeFormatting} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {formatDatetime} from 'utils'
import {GuidanceArticle} from '../../types'
import css from './GuidanceList.less'

type SortState = {
    column: 'title' | 'lastUpdated'
    direction: OrderDirection
}

const initialSortState: SortState = {
    column: 'lastUpdated',
    direction: OrderDirection.Desc,
}

const compareDates = (a: string, b: string, direction: OrderDirection) => {
    return direction === OrderDirection.Asc
        ? new Date(a).getTime() - new Date(b).getTime()
        : new Date(b).getTime() - new Date(a).getTime()
}

type Props = {
    guidanceArticles: GuidanceArticle[]
    onDelete: (articleId: number) => void
}

export const GuidanceList = ({guidanceArticles, onDelete}: Props) => {
    const [sortState, setSortState] = useState<SortState>(initialSortState)

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    const onSortClick = (column: SortState['column']) => {
        const initialDirection =
            sortState.column === column ? undefined : OrderDirection.Asc
        const newDirection =
            sortState.direction === OrderDirection.Asc
                ? OrderDirection.Desc
                : OrderDirection.Asc

        setSortState({
            column,
            direction: initialDirection ?? newDirection,
        })
    }

    const sortedGuidanceArticles = useMemo(
        () =>
            guidanceArticles.sort((a, b) => {
                if (sortState.column === 'title') {
                    return sortState.direction === OrderDirection.Asc
                        ? a.title.localeCompare(b.title)
                        : b.title.localeCompare(a.title)
                }

                if (sortState.column === 'lastUpdated') {
                    return compareDates(
                        a.lastUpdated,
                        b.lastUpdated,
                        sortState.direction
                    )
                }

                return 0
            }),
        [guidanceArticles, sortState.column, sortState.direction]
    )

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCellProperty
                    title="Guidance"
                    onClick={() => onSortClick('title')}
                    isOrderedBy={sortState.column === 'title'}
                    direction={sortState.direction}
                />
                <HeaderCellProperty
                    title="Last updated"
                    onClick={() => onSortClick('lastUpdated')}
                    isOrderedBy={sortState.column === 'lastUpdated'}
                    direction={sortState.direction}
                />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {sortedGuidanceArticles.map((article) => (
                    <TableBodyRow key={article.id} data-testid="guidance-row">
                        <BodyCell
                            innerClassName={css.itemTitle}
                            data-testid="guidance-title"
                        >
                            {article.title}
                        </BodyCell>
                        <BodyCell>
                            {formatDatetime(
                                article.lastUpdated,
                                datetimeFormat
                            )}
                        </BodyCell>
                        <BodyCell>
                            <ConfirmationPopover
                                placement="bottom"
                                buttonProps={{
                                    intent: 'destructive',
                                }}
                                confirmLabel="Delete"
                                title="Delete Guidance?"
                                content={
                                    <p>
                                        Are you sure you want to delete
                                        <b>{article.title}</b> Guidance?
                                    </p>
                                }
                                onConfirm={() => {
                                    onDelete(article.id)
                                }}
                            >
                                {({uid, elementRef, onDisplayConfirmation}) => (
                                    <IconButton
                                        onClick={onDisplayConfirmation}
                                        id={uid}
                                        className={css.deleteButton}
                                        fillStyle="ghost"
                                        intent="secondary"
                                        aria-label="Delete guidance"
                                        ref={elementRef}
                                    >
                                        delete
                                    </IconButton>
                                )}
                            </ConfirmationPopover>
                        </BodyCell>
                    </TableBodyRow>
                ))}
            </TableBody>
        </TableWrapper>
    )
}
