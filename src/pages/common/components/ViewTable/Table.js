import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'

import Loader from '../Loader'
import BlankState from '../BlankState'
import Pagination from '../Pagination'

import Row from './Table/Row'
import HeaderCell from './Table/HeaderCell'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'

import css from './Table.less'

@connect((state, ownProps) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        config: viewsSelectors.getViewConfig(ownProps.type),
        isLoading: viewsSelectors.makeIsLoading(state),
        pagination: viewsSelectors.getPagination(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}, {
    fetchPage: viewsActions.fetchPage,
    toggleSelection: viewsActions.toggleSelection,
    resetView: viewsActions.resetView,
})
export default class Table extends React.Component {
    static propTypes = {
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        fetchPage: PropTypes.func.isRequired,
        fields: ImmutablePropTypes.list.isRequired,
        isLoading: PropTypes.func.isRequired,
        isSearch: PropTypes.bool.isRequired,
        items: ImmutablePropTypes.list.isRequired,
        pagination: ImmutablePropTypes.map.isRequired,
        resetView: PropTypes.func.isRequired,
        selectedItemsIds: ImmutablePropTypes.list.isRequired,
        toggleSelection: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    }

    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
    }

    _toggleSelectAll = () => {
        const itemsIds = this.props.items.map(item => item.get('id'))
        this.props.toggleSelection(itemsIds, true)
    }

    _renderPagination = () => {
        const {pagination} = this.props

        return (
            <Pagination
                pageCount={pagination.get('nb_pages') || 1}
                currentPage={pagination.get('page') || 1}
                onChange={(page) => {
                    // update page query param of current location (add/update "page" param)
                    const location = Object.assign({}, browserHistory.getCurrentLocation())
                    Object.assign(location.query, {page})
                    browserHistory.push(location)
                }}
            />
        )
    }

    render() {
        const {
            activeView,
            config,
            isLoading,
            isSearch,
            items,
            fields,
            selectedItemsIds,
            type,
        } = this.props

        if (isLoading('fetchList')) {
            return <Loader loading />
        }

        // if empty view or view fields => show message
        if (items.isEmpty()) {
            let message

            // if view is being modified, which resulted in an empty list
            if (activeView.get('dirty')) {
                message = (
                    <p>
                        No {config.get('singular')} found.
                        <br />
                        {
                            !isSearch && (
                                <a
                                    onClick={() => {
                                        this.props.resetView(config.get('name'))
                                        this.props.fetchPage(1)
                                    }}
                                >
                                    Reset view
                                </a>
                            )
                        }
                    </p>
                )
            }

            return (
                <div>
                    <BlankState message={message} />
                    {this._renderPagination()}
                </div>
            )
        }

        const areAllSelected = items.size === selectedItemsIds.size

        return (
            <div>
                <table className={classnames(css.table, 'main-table view-table')}>
                    <thead>
                        <tr>
                            <td
                                className="cell-wrapper cell-short clickable hidden-sm-down"
                                onClick={this._toggleSelectAll}
                            >
                                <span className="ui checkbox">
                                    <input
                                        type="checkbox"
                                        checked={areAllSelected}
                                    />
                                    <label />
                                </span>
                            </td>
                            {
                                fields.map((field, index) => {
                                    return (
                                        <HeaderCell
                                            key={field.get('name')}
                                            field={field}
                                            fields={fields}
                                            type={type}
                                            isLast={fields.size === index + 1}
                                            isSearch={isSearch}
                                        />
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            items.map((item) => {
                                const id = item.get('id')

                                return (
                                    <Row
                                        key={id}
                                        fields={fields}
                                        item={item}
                                        isSelected={selectedItemsIds.includes(id)}
                                        type={type}
                                    />
                                )
                            })
                        }
                    </tbody>
                </table>

                {this._renderPagination()}
            </div>
        )
    }
}

