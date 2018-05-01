import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'

import Row from './Row'

class Table extends Component {
    _getSort() {
        if (!this.props.sort) {
            return this.props.columns[0].field
        }

        return this.props.sort
    }

    _sortIconClassName = (sort, reverse, field) => {
        return classnames('fa fa-fw', {
            'fa-sort-desc': (sort === field && !reverse),
            'fa-sort-asc': (sort === field && reverse)
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
        const {rows, columns, reverse, onSelectAll} = this.props
        const sort = this._getSort()
        const sortedRows = rows.get('items')

        return (
            <table className="view-table">
                <thead>
                    <tr>
                        <td
                            className="cell-wrapper cell-short clickable"
                            onClick={onSelectAll}
                        >
                            <input
                                type="checkbox"
                                checked={rows.getIn(['_internal', 'selectAll'], false)}
                            />
                        </td>
                        {
                            columns.map((column, i) => (
                                <td key={i}>
                                    <div>
                                        <div className="cell-wrapper">
                                            <div onClick={this._onSort(column.field)}>
                                            <span className="clickable filterable">
                                                {column.title}
                                            </span>
                                                <i className={this._sortIconClassName(sort, reverse, column.field)} />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            ))
                        }
                        <td />
                    </tr>
                </thead>

                <tbody>
                    {
                        sortedRows.map((tag, i) => (
                            <Row
                                key={i}
                                row={tag}
                                refresh={this.props.refresh}
                                meta={rows.getIn(['meta', tag.get('id')]) || fromJS({})}
                            />
                        ))
                    }
                </tbody>
            </table>
        )
    }
}

Table.propTypes = {
    rows: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    onSort: PropTypes.func.isRequired,
    onSelectAll: PropTypes.func.isRequired,
    refresh: PropTypes.func.isRequired,

    sort: PropTypes.string,
    reverse: PropTypes.bool
}

Table.defaultProps = {
    columns: [{
        title: 'Tag',
        field: 'name',
    }, {
        title: 'Tickets',
        field: 'usage',
    }]
}

export default Table
