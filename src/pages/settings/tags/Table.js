// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {List, Map} from 'immutable'
import classnames from 'classnames'

import Row from './Row'
import * as tagsSelectors from '../../../state/tags/selectors'

import css from './Table.less'

type Props = {
    getSelectedTagMeta: (number) => Map<*, *>,
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
            title: 'Description',
            field: 'description',
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
        const {tags, getSelectedTagMeta, selectAll, columns, reverse, onSelectAll} = this.props
        const sort = this._getSort()

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
                        />
                    </td>
                    {
                        columns.map((column, i) => (
                            <td key={i}>
                                <div
                                    className="cell-wrapper"
                                    onClick={this._onSort(column.field)}
                                >
                                    <div>
                                        <span>
                                            {column.title}
                                        </span>
                                        {this._sortIcon(sort, reverse, column.field)}
                                    </div>
                                </div>
                            </td>
                        ))
                    }
                    <td/>
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
