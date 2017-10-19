// @flow
import React from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'

import Loader from '../Loader'
import BlankState from '../BlankState'
import Pagination from '../Pagination'

import Row from './Table/Row'
import HeaderCell from './Table/HeaderCell'
import shortcutManager from '../../../../services/shortcutManager'
import {moveIndex} from '../../../common/utils/keyboard'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'

import * as viewsConfig from '../../../../config/views'

import css from './Table.less'

import type {Map, List} from 'immutable'
import type {viewType} from '../../../../state/views/types'

type directionType = 'next' | 'previous'
type Props = {
    activeView: viewType,
    config: Map<*,*>,
    isLoading: (T: string) => boolean,
    pagination: Map<*,*>,
    selectedItemsIds: List<*>,
    fields: List<*>,
    items: List<*>,
    isSearch: boolean,
    type: string,

    fetchPage: typeof viewsActions.fetchPage,
    resetView: typeof viewsActions.resetView,
    toggleSelection: typeof viewsActions.toggleSelection,

    ActionsComponent?: () => void,
}

type State = {
    rowCursor: number
}

@connect((state, ownProps) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        config: viewsConfig.getConfigByName(ownProps.type),
        isLoading: viewsSelectors.makeIsLoading(state),
        pagination: viewsSelectors.getPagination(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}, {
    fetchPage: viewsActions.fetchPage,
    toggleSelection: viewsActions.toggleSelection,
    resetView: viewsActions.resetView,
})
export default class Table extends React.Component<Props, State> {
    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
    }

    state = {
        rowCursor: 0
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('View')
    }

    componentWillReceiveProps(nextProps: Props) {
        // new items loaded
        // $FlowFixMe
        if(!nextProps.items.equals(this.props.items)) {
            this.setState({rowCursor: 0})
        }
    }

    _bindKeys() {
        shortcutManager.bind('View', {
            GO_NEXT_PAGE: {
                action: () => this._movePage()
            },
            GO_PREV_PAGE: {
                action: () => this._movePage('previous')
            },
            GO_NEXT_ROW: {
                action: () => this._moveCursor()
            },
            GO_PREV_ROW: {
                action: () => this._moveCursor('previous')
            },
            CHECK_ITEM: {
                action: () => {
                    const cursorId = this.props.items.getIn([this.state.rowCursor, 'id'])
                    if (cursorId) {
                        this.props.toggleSelection(cursorId)
                    }
                }
            },
            OPEN_ITEM: {
                action: () => {
                    const item = this.props.items.get(this.state.rowCursor)
                    browserHistory.push(this._getItemLink(item))
                }
            }
        })
    }

    _getItemLink = (item: Map<*,*>) => {
        return `/app/${this.props.config.get('routeItem')}/${item.get('id')}`
    }

    _moveCursor = (direction: directionType = 'next') => {
        this.setState({
            rowCursor: moveIndex(this.state.rowCursor, this.props.items.size, {direction})
        })
    }

    _toggleSelectAll = () => {
        const itemsIds = this.props.items.map(item => item.get('id'))
        this.props.toggleSelection(itemsIds, true)
    }

    _movePage = (direction: directionType = 'next') => {
        const {pagination} = this.props
        const currentPage = parseInt(pagination.get('page')) || 1
        const allPages = parseInt(pagination.get('nb_pages')) || 1

        if (allPages === 1) {
            return
        }

        this._pageChange(
            moveIndex(currentPage - 1, allPages, {direction}) + 1
        )
    }

    _pageChange = (page: number) => {
        // update page query param of current location (add/update "page" param)
        const location = Object.assign({}, browserHistory.getCurrentLocation())
        Object.assign(location.query, {page})
        browserHistory.push(location)
    }

    _renderPagination = () => {
        const {pagination} = this.props

        return (
            <Pagination
                pageCount={pagination.get('nb_pages') || 1}
                currentPage={pagination.get('page') || 1}
                onChange={this._pageChange}
            />
        )
    }

    render() {
        const {
            ActionsComponent,
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
            return <Loader />
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
                                <input
                                    type="checkbox"
                                    checked={areAllSelected}
                                />
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
                                            ActionsComponent={ActionsComponent}
                                        />
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            items.map((item, index) => {
                                const id = item.get('id')

                                return (
                                    <Row
                                        key={id}
                                        fields={fields}
                                        item={item}
                                        isSelected={selectedItemsIds.includes(id)}
                                        type={type}
                                        hasCursor={this.state.rowCursor === index}
                                        link={this._getItemLink(item)}
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

