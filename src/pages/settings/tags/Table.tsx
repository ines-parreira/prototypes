import React, {useMemo} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {ListTagsOrderBy, Tag} from '@gorgias/api-queries'

import useAppSelector from 'hooks/useAppSelector'
import {ORDER_BY, OrderBy} from 'models/tag/types'
import CheckBox from 'pages/common/forms/CheckBox'
import {
    getMeta,
    makeGetSelectedTagMeta,
    getSelectAll,
} from 'state/tags/selectors'

import Row from './Row'
import css from './Table.less'
import TableActions from './TableActions/TableActions'

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
    onSelectAll: () => void
    onSort: (sort: OrderBy, direction: boolean) => void
    refresh: (args?: {refreshPreviousPage?: boolean}) => void
    reverse: boolean
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
    sort,
    tags,
}: Props) => {
    const isAllSelected = useAppSelector(getSelectAll)
    const getSelectedTagMeta = useAppSelector(makeGetSelectedTagMeta)
    const meta = useAppSelector(getMeta)

    const sortValue = useMemo(() => sort ?? columns[0].field, [columns, sort])

    const handleOnSort = (value: string) => {
        if (!isSortable(value)) {
            return
        }
        onSort(value, sort === value ? !reverse : false)
    }

    const selectedNum = meta.filter(
        (meta: Map<any, any>) => meta.get('selected') as boolean
    ).size

    return (
        <table className={classnames('view-table', css.table)}>
            <thead>
                <tr>
                    <td
                        className="cell-wrapper cell-short clickable"
                        onClick={onSelectAll}
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
                                    'cell-wrapper'
                                )}
                            >
                                {i === 0 && (
                                    <TableActions
                                        selectedNum={selectedNum}
                                        tags={fromJS(tags)}
                                        meta={meta}
                                        onMerge={onMerge}
                                        onBulkDelete={onBulkDelete}
                                    />
                                )}
                                <div onClick={() => handleOnSort(column.field)}>
                                    <span className="field-title">
                                        {column.title}
                                    </span>
                                    {sortValue !== column.field ? null : (
                                        <i
                                            className={classnames(
                                                'material-icons md-1',
                                                css.sort
                                            )}
                                        >
                                            {reverse
                                                ? 'arrow_drop_down'
                                                : 'arrow_drop_up'}
                                        </i>
                                    )}
                                </div>
                            </div>
                        </td>
                    ))}
                    <td />
                </tr>
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
