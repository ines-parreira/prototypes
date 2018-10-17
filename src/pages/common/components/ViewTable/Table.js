// @flow
import React from 'react'
import {fromJS, Map, List} from 'immutable'
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

import css from './Table.less'

import type {viewType} from '../../../../state/views/types'


type directionType = 'next' | 'previous'

type Props = {
    view: viewType,
    config: Map<*,*>,
    isLoading: (T: string) => boolean,
    pagination: Map<*,*>,
    selectedItemsIds: ?List<*>,
    fields: List<*>,
    items: List<*>,
    isSearch: boolean,
    type: string,
    selectable: ?boolean,
    onItemClick: ?(number) => void,
    getItemUrl: ?(Map<*,*>) => string,

    fetchPage: typeof viewsActions.fetchPage,
    resetView: typeof viewsActions.resetView,
    toggleSelection: typeof viewsActions.toggleSelection,
    onPageChange: (number) => void,

    ActionsComponent?: () => void,
}

type State = {
    rowCursor: number
}

class Table extends React.Component<Props, State> {
    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
        selectable: true
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
                action: (e) => {
                    e.preventDefault()
                    const item = this.props.items.get(this.state.rowCursor)
                    const {onItemClick, getItemUrl} = this.props

                    if (onItemClick) {
                        onItemClick(item)
                    } else if (getItemUrl) {
                        browserHistory.push(getItemUrl(item))
                    }
                }
            }
        })
    }

    _moveCursor = (direction: directionType = 'next') => {
        this.setState({
            rowCursor: moveIndex(this.state.rowCursor, this.props.items.size, {direction})
        })
    }

    _toggleSelectAll = () => {
        const itemsIds = this.props.items.map((item) => item.get('id'))
        this.props.toggleSelection(itemsIds, true)
    }

    _movePage = (direction: directionType = 'next') => {
        const {pagination, onPageChange} = this.props
        const currentPage = parseInt(pagination.get('page')) || 1
        const allPages = parseInt(pagination.get('nb_pages')) || 1

        if (allPages === 1) {
            return
        }

        onPageChange(
            moveIndex(currentPage - 1, allPages, {direction}) + 1
        )
    }

    _renderPagination = () => {
        const {pagination, onPageChange} = this.props

        return (
            <Pagination
                pageCount={pagination.get('nb_pages') || 1}
                currentPage={pagination.get('page') || 1}
                onChange={onPageChange}
                className={classnames(css.pagination, 'pagination-transparent')}
            />
        )
    }

    render() {
        const {
            ActionsComponent,
            view,
            config,
            isLoading,
            isSearch,
            items,
            fields,
            selectable,
            selectedItemsIds,
            type,
            resetView,
            fetchPage,
            onItemClick,
            getItemUrl
        } = this.props

        if (isLoading('fetchList')) {
            return <Loader />
        }

        // if empty view or view fields => show message
        if (items.isEmpty()) {
            let message

            // if view is being modified, which resulted in an empty list
            if (view.get('dirty')) {
                message = (
                    <p>
                        No {config.get('singular')} found.
                        <br />
                        {
                            !isSearch ? (
                                <a
                                    onClick={() => {
                                        resetView(config.get('name'))
                                        fetchPage(1)
                                    }}
                                >
                                    Reset view
                                </a>
                            ) : null
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

        const areAllSelected = !!selectedItemsIds && items.size === selectedItemsIds.size

        return (
            <div>
                <table className={classnames(css.table, 'view-table')}>
                    <thead>
                        <tr>
                            {
                                selectable ? (
                                    <td
                                        className="cell-wrapper cell-short clickable d-none d-md-table-cell"
                                        onClick={this._toggleSelectAll}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={areAllSelected}
                                        />
                                    </td>
                                ) : null
                            }
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
                            items.map((item: Map<*,*>, index: number) => {
                                const id = item.get('id')

                                return (
                                    <Row
                                        key={id}
                                        fields={fields}
                                        item={item}
                                        selectable={selectable}
                                        isSelected={!!selectedItemsIds && selectedItemsIds.includes(id)}
                                        type={type}
                                        hasCursor={this.state.rowCursor === index}
                                        onItemClick={onItemClick}
                                        itemUrl={getItemUrl ? getItemUrl(item) : null}
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

export default connect(null, {
    fetchPage: viewsActions.fetchPage,
    toggleSelection: viewsActions.toggleSelection,
    resetView: viewsActions.resetView,
})(Table)

