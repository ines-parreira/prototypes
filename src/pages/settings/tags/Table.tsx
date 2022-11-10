import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'

import {Tag, TagSortableProperties} from 'models/tag/types'
import CheckBox from 'pages/common/forms/CheckBox'
import {
    getMeta,
    makeGetSelectedTagMeta,
    getSelectAll,
} from 'state/tags/selectors'
import {RootState} from 'state/types'

import Row from './Row'
import css from './Table.less'
import TableActions from './TableActions/TableActions'

const sortableColumns = Object.values(TagSortableProperties)

function isSortable(value: string): value is TagSortableProperties {
    return sortableColumns.includes(value as TagSortableProperties)
}

type Props = {
    columns: Array<{
        title: string
        field: string
    }>
    onBulkDelete: () => void
    onMerge: () => void
    onSelectAll: () => void
    onSort: (sort: TagSortableProperties, direction: boolean) => void
    refresh: (args?: {refreshPreviousPage?: boolean}) => void
    reverse: boolean
    sort: string
    tags: Tag[]
} & ConnectedProps<typeof connector>

export class TableContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'columns'> = {
        columns: [
            {
                title: 'Tag',
                field: 'name',
            },
            {
                title: 'Description',
                field: 'description',
            },
            {
                title: 'Tickets',
                field: TagSortableProperties.Usage,
            },
        ],
    }

    _getSort() {
        if (!this.props.sort) {
            return this.props.columns[0].field
        }

        return this.props.sort
    }

    _sortIcon = (sort: string, reverse: boolean | null, field: string) => {
        if (sort !== field) {
            return null
        }
        const iconName = reverse ? 'arrow_drop_up' : 'arrow_drop_down'
        return (
            <i className={classnames('material-icons md-1', css.sort)}>
                {iconName}
            </i>
        )
    }

    _onSort = (sort: string) => () => {
        if (!isSortable(sort)) {
            return
        }
        let reverse = false
        // already sorted by this prop
        if (this.props.sort === sort) {
            reverse = !this.props.reverse
        }

        this.props.onSort(sort, reverse)
    }

    render() {
        const {
            tags,
            getSelectedTagMeta,
            selectAll,
            columns,
            reverse,
            onSelectAll,
            meta,
            onMerge,
            onBulkDelete,
        } = this.props
        const sort = this._getSort()

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
                            <CheckBox name="select-all" isChecked={selectAll} />
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
                                    <div onClick={this._onSort(column.field)}>
                                        <span>{column.title}</span>
                                        {this._sortIcon(
                                            sort,
                                            reverse,
                                            column.field
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
                                if (Object.keys(tags).length === 1) {
                                    this.props.refresh({
                                        refreshPreviousPage: true,
                                    })
                                } else {
                                    this.props.refresh()
                                }
                            }}
                            meta={getSelectedTagMeta(tag.id)}
                        />
                    ))}
                </tbody>
            </table>
        )
    }
}

const connector = connect((state: RootState) => ({
    selectAll: getSelectAll(state),
    getSelectedTagMeta: makeGetSelectedTagMeta(state),
    meta: getMeta(state),
}))

export default connector(TableContainer)
