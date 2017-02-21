import React, {Component, PropTypes} from 'react'
import ManageTagsTableRow from './ManageTagsTableRow'
import classnames from 'classnames'
import {fromJS} from 'immutable'

class ManageTagsTable extends Component {
    _sortRows = (rows, key, reverse) => rows.sort((a, b) => {
        if (a.get(key) < b.get(key)) {
            return reverse ? 1 : -1
        }

        if (a.get(key) > b.get(key)) {
            return reverse ? -1 : 1
        }

        return 0
    })


    _getSort() {
        if (!this.props.sort) {
            return this.props.columns[0].field
        }

        return this.props.sort
    }

    _sortIconClassName = (sort, reverse, field) => classnames(
        'action sort icon caret',
        {
            down: (sort === field && !reverse),
            up: (sort === field && reverse)
        }
    )

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
        const sortedRows = this._sortRows(rows.get('items'), sort, reverse)

        return (
            <table className="main-table view-table">
                <thead>
                    <tr>
                        <td
                            className="cell-wrapper cell-short clickable"
                            onClick={onSelectAll}
                        >
                            <span className="ui checkbox">
                                <input
                                    type="checkbox"
                                    checked={rows.getIn(['_internal', 'selectAll'], false)}
                                />
                                <label />
                            </span>
                        </td>
                        {columns.map((column, i) => (
                            <td key={i}>
                                <div>
                                    <div className={`cell-wrapper manage-tags-table-col-${column.field}`}>
                                        <div onClick={this._onSort(column.field)}>
                                            <span className="clickable filterable">
                                                {column.title}
                                            </span>
                                            <i className={this._sortIconClassName(sort, reverse, column.field)} />
                                        </div>
                                    </div>
                                </div>
                            </td>
                        ))}
                        <td></td>
                    </tr>
                </thead>

                <tbody>
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
                </tbody>
            </table>
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
        field: 'name',
    }, {
        title: 'Tickets',
        field: 'count_tickets',
    }]
}

export default ManageTagsTable
