// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {List, Map} from 'immutable'
import classnames from 'classnames'

import * as tagsSelectors from '../../../state/tags/selectors'

import Row from './Row'

import css from './Table.less'
import TableActions from './TableActions'

type Props = {
    meta: Map<*, *>,
    getSelectedTagMeta: (number) => Map<*, *>,
    selectAll: boolean,
    tags: List<*>,
    columns: Array<*>,
    onSort: (string, boolean) => void,
    onSelectAll: () => void,
    refresh: () => void,
    sort: string,
    reverse: boolean,
    onMerge: () => any,
    onBulkDelete: () => any,
}

class Table extends Component<Props> {
    static defaultProps = {
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
                field: 'usage',
            },
        ],
    }

    _getSort() {
        if (!this.props.sort) {
            return this.props.columns[0].field
        }

        return this.props.sort
    }

    _sortIcon = (sort: string, reverse: ?boolean, field: string) => {
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

        const selectedNum = meta.filter((meta) => meta.get('selected')).size

        return (
            <table className={classnames('view-table', css.table)}>
                <thead>
                    <tr>
                        <td
                            className="cell-wrapper cell-short clickable"
                            onClick={onSelectAll}
                        >
                            <input
                                type="checkbox"
                                checked={selectAll}
                                readOnly={true}
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
                    {tags.map((tag, i) => (
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

export default connect((state) => {
    return {
        tags: tagsSelectors.getTags(state),
        selectAll: tagsSelectors.getSelectAll(state),
        getSelectedTagMeta: tagsSelectors.makeGetSelectedTagMeta(state),
        meta: tagsSelectors.getMeta(state),
    }
})(Table)
