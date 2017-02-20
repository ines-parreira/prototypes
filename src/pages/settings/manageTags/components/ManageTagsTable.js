import React, {Component, PropTypes} from 'react'
import ManageTagsTableRow from './ManageTagsTableRow'
import classnames from 'classnames'
import {fromJS} from 'immutable'

class ManageTagsTable extends Component {
    sortRows(rows, key, reverse) {
        return rows.sort((a, b) => {
            if (a.get(key) < b.get(key)) {
                return reverse ? 1 : -1
            }

            if (a.get(key) > b.get(key)) {
                return reverse ? -1 : 1
            }

            return 0
        })
    }

    _getSort() {
        if (!this.props.sort) {
            return this.props.columns[0].field
        }

        return this.props.sort
    }

    _sortIconClassName(sort, reverse, field) {
        return classnames('action sort icon caret', {
            down: (sort === field && !reverse),
            up: (sort === field && reverse)
        })
    }

    _onSort = (sort) => {
        return () => {
            let reverse = this.props.reverse
            // already sorted by this prop
            if (this.props.sort === sort) {
                reverse = !reverse
            }

            this.props.onSort(sort, reverse)
        }
    }

    render() {
        const {rows, columns, reverse, onEdit, onCancel, onSave, onRemove, onSelect, onSelectAll} = this.props
        const sort = this._getSort()
        const sortedRows = this.sortRows(rows.get('items'), sort, reverse)

        return (
            <div className="manage-tags-table complex-list-table ui selectable very basic table">
                <div className="complex-list-table-row complex-list-table-header">
                    <label className="complex-list-table-col manage-tags-table-col-checkbox">
                        <span className="ui checkbox">
                            <input type="checkbox" checked={rows.getIn(['_internal', 'selectAll'], false)} onChange={onSelectAll} value/>
                            <label />
                        </span>
                    </label>

                    {columns.map((column, i) => (
                        <div className={`complex-list-table-col manage-tags-table-col-${column.field}`} key={i}>
                            <span className="plain-column-header-label">
                                {column.title}

                                <i className={this._sortIconClassName(sort, reverse, column.field)} onClick={this._onSort(column.field)}></i>
                            </span>
                        </div>
                    ))}
                    <div className="complex-list-table-col"></div>
                </div>
                {
                    sortedRows.map((tag, i) => (
                        <ManageTagsTableRow
                            key={i}
                            row={tag}
                            meta={rows.getIn(['meta', tag.get('id')]) || fromJS({})}
                            onEdit={onEdit}
                            onSave={onSave}
                            onCancel={onCancel}
                            onRemove={onRemove}
                            onSelect={onSelect}
                        />
                    ))
                }
            </div>
        )
    }
}

ManageTagsTable.propTypes = {
    rows: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    onSort: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSelectAll: PropTypes.func.isRequired,

    sort: PropTypes.string,
    reverse: PropTypes.bool
}

ManageTagsTable.defaultProps = {
    columns: [{
        title: 'Tag',
        field: 'name'
    }, {
        title: 'Tickets',
        field: 'count'
    }]
}

export default ManageTagsTable
