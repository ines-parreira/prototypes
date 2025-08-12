import React, { useMemo } from 'react'

import classnames from 'classnames'
import { List } from 'immutable'

import { Button } from '@gorgias/axiom'
import { ListTagsOrderBy, Tag } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { ORDER_BY, OrderBy } from 'models/tag/types'
import CheckBox from 'pages/common/forms/CheckBox'
import { getSelectAll, makeGetSelectedTagMeta } from 'state/tags/selectors'

import Row from './Row'
import TableActions from './TableActions/TableActions'

import css from './Table.less'

function isSortable(value: string): value is OrderBy {
    return ORDER_BY.includes(value as OrderBy)
}

type Props = {
    columns?: Array<{
        title: string
        field: string
    }>
    onBulkDelete: () => void
    onMerge: () => void
    onSelectAll: (value?: boolean) => void
    onSort: (sort: OrderBy, direction: boolean) => void
    refresh: (args?: { refreshPreviousPage?: boolean }) => void
    reverse: boolean
    selectedTagsIds: List<number>
    sort?: string
    tags: Tag[]
}

const Table = ({
    columns = [
        {
            title: 'Tag',
            field: ListTagsOrderBy.Name,
        },
        {
            title: 'Description',
            field: 'description',
        },
        {
            title: 'Tickets',
            field: ListTagsOrderBy.Usage,
        },
    ],
    onBulkDelete,
    onMerge,
    onSelectAll,
    onSort,
    refresh,
    reverse,
    selectedTagsIds,
    sort,
    tags,
}: Props) => {
    const isAllSelected = useAppSelector(getSelectAll)
    const keyedTags = useMemo(
        () =>
            Object.assign(
                {},
                ...tags.map((tag) => ({ [tag.id]: tag })),
            ) as Record<number, Tag>,
        [tags],
    )
    const getSelectedTagMeta = useAppSelector(makeGetSelectedTagMeta)
    const areAllSelectedTagsAtCurrentPage = useMemo(
        () => selectedTagsIds.every((id) => !!keyedTags[id!]),
        [keyedTags, selectedTagsIds],
    )

    const sortValue = useMemo(() => sort ?? columns[0].field, [columns, sort])

    const handleOnSort = (field: string) => {
        if (isSortable(field)) {
            onSort(field, sort === field ? !reverse : false)
        }
    }

    const clearSelection = () => onSelectAll(false)

    return (
        <table className={classnames('view-table', css.table)}>
            <thead>
                <tr>
                    <td
                        className="cell-wrapper cell-short clickable"
                        onClick={() => onSelectAll()}
                    >
                        <CheckBox
                            labelClassName={css.checkBoxLabel}
                            className={css.checkBox}
                            name="select-all"
                            aria-label="select-all"
                            isChecked={isAllSelected}
                        />
                    </td>
                    {columns.map((column, i) => (
                        <td key={i}>
                            <div
                                className={classnames(
                                    css.headerCell,
                                    'cell-wrapper',
                                )}
                            >
                                {i === 0 && (
                                    <TableActions
                                        onMerge={onMerge}
                                        onBulkDelete={onBulkDelete}
                                        selectedTagsIds={selectedTagsIds}
                                    />
                                )}
                                <Button
                                    className={classnames(css.columnHeadCell, {
                                        [css.isNotSortable]: !isSortable(
                                            column.field,
                                        ),
                                    })}
                                    intent="secondary"
                                    onClick={() => handleOnSort(column.field)}
                                    size="small"
                                    fillStyle="ghost"
                                    trailingIcon={
                                        sortValue !== column.field
                                            ? undefined
                                            : reverse
                                              ? 'arrow_drop_down'
                                              : 'arrow_drop_up'
                                    }
                                >
                                    {column.title}
                                </Button>
                            </div>
                        </td>
                    ))}
                    <td />
                </tr>
                {!areAllSelectedTagsAtCurrentPage && (
                    <tr>
                        <td className={css.banner} colSpan={5}>
                            <i
                                className={classnames(
                                    'material-icons',
                                    css.icon,
                                )}
                            >
                                warning
                            </i>
                            You have <b>{selectedTagsIds.size}</b> tag
                            {selectedTagsIds.size > 1 && 's'} selected across
                            different pages.{' '}
                            <span
                                className="clickable"
                                onClick={clearSelection}
                            >
                                Undo selection
                            </span>
                        </td>
                    </tr>
                )}
            </thead>

            <tbody>
                {tags.map((tag) => (
                    <Row
                        key={tag.id}
                        row={tag}
                        refresh={() => {
                            if (tags.length === 1) {
                                refresh({
                                    refreshPreviousPage: true,
                                })
                            } else {
                                refresh()
                            }
                        }}
                        meta={getSelectedTagMeta(tag.id)}
                    />
                ))}
            </tbody>
        </table>
    )
}

export default Table
