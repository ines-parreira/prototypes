// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Map, List} from 'immutable'

import Row from './Row'
import * as tagsSelectors from '../../../state/tags/selectors'

type Props = {
    getSelectedTagMeta: (number) => Map<*,*>,
    selectAll: boolean,
    tags: List<*>,
    columns: Array<*>,
    onSort: (string, boolean) => void,
    onSelectAll: () => void,
    refresh: () => void,

    sort: string,
    reverse: boolean
}

class Table extends Component<Props> {
    static defaultProps = {
        columns: [{
            title: 'Tag',
            field: 'name',
        }, {
            title: 'Tickets',
            field: 'usage',
        }]
    }

    _getSort() {
        if (!this.props.sort) {
            return this.props.columns[0].field
        }

        return this.props.sort
    }

    _sortIconClassName = (sort: string, reverse: ?boolean, field: string) => {
        return classnames('fa fa-fw', {
            'fa-sort-desc': (sort === field && !reverse),
            'fa-sort-asc': (sort === field && reverse)
        })
    }

    _onSort = (sort: string) => {
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
        const {tags, getSelectedTagMeta, selectAll, columns, reverse, onSelectAll} = this.props
        const sort = this._getSort()

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
                                checked={selectAll}
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
                        tags.map((tag, i) => (
                            <Row
                                key={i}
                                row={tag}
                                refresh={this.props.refresh}
                                meta={getSelectedTagMeta(tag.get('id'))}
                            />
                        ))
                    }
                </tbody>
            </table>
        )
    }
}


export default connect((state) => {
    return {
        tags: tagsSelectors.getTags(state),
        selectAll: tagsSelectors.getSelectAll(state),
        getSelectedTagMeta: tagsSelectors.makeGetSelectedTagMeta(state)
    }
})(Table)
