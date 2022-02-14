import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Map} from 'immutable'
import classnames from 'classnames'

import CheckBox from 'pages/common/forms/CheckBox'
import {
    getMeta,
    makeGetSelectedTagMeta,
    getSelectAll,
    getTags,
} from '../../../state/tags/selectors'
import {RootState} from '../../../state/types'

import Row from './Row'
import css from './Table.less'
import TableActions from './TableActions/TableActions'

type Props = {
    columns: Array<{title: string; field: string; isSortable: boolean}>
    onBulkDelete: () => void
    onMerge: () => void
    onSelectAll: () => void
    onSort: (sort: string, direction: boolean) => void
    refresh: () => void
    reverse: boolean
    sort: string
} & ConnectedProps<typeof connector>

export class TableContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'columns'> = {
        columns: [
            {
                title: 'Tag',
                field: 'name',
                isSortable: true,
            },
            {
                title: 'Description',
                field: 'description',
                isSortable: false,
            },
            {
                title: 'Tickets',
                field: 'usage',
                isSortable: true,
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

    _onSort = (sort: string) => {
        return () => {
            const {columns} = this.props
            if (
                !(columns.find((column) => column.field === sort) || {})
                    .isSortable
            ) {
                return
            }
            let reverse = false
            // already sorted by this prop
            if (this.props.sort === sort) {
                reverse = !this.props.reverse
            }

            this.props.onSort(sort, reverse)
        }
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
                            <CheckBox isChecked={selectAll} readOnly />
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
                                            tags={tags}
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
                    {tags.map((tag: Map<any, any>, i) => (
                        <Row
                            key={i}
                            row={tag}
                            refresh={this.props.refresh}
                            meta={getSelectedTagMeta(tag.get('id'))}
                        />
                    ))}
                </tbody>
            </table>
        )
    }
}

const connector = connect((state: RootState) => ({
    tags: getTags(state),
    selectAll: getSelectAll(state),
    getSelectedTagMeta: makeGetSelectedTagMeta(state),
    meta: getMeta(state),
}))

export default connector(TableContainer)
