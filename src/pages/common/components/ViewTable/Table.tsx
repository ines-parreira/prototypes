import React from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {browserHistory} from 'react-router'

import Loader from '../Loader/index.js'
import BlankState from '../BlankState/index.js'
import Navigation from '../Navigation/index.js'
import {RootState} from '../../../../state/types'
import shortcutManager from '../../../../services/shortcutManager'
import {moveIndex, MoveIndexDirection} from '../../../common/utils/keyboard'
import * as viewsActions from '../../../../state/views/actions'
import {areAllActiveViewItemsSelected} from '../../../../state/views/selectors'
import {ViewImmutable, ViewNavDirection} from '../../../../state/views/types'

import css from './Table.less'
import HeaderCell from './Table/HeaderCell.js'
import Row from './Table/Row.js'
import ViewSelection from './Table/ViewSelection.js'

type OwnProps = {
    view: ViewImmutable
    config: Map<any, any>
    isLoading: (list: string) => boolean
    isSearch: boolean
    selectable: boolean
    navigation: Map<any, any>
    selectedItemsIds: List<any>
    type: string
    items: List<any>
    fields: List<any>
    ActionsComponent: Maybe<React.ComponentType>
    getItemUrl: (item: Map<any, any>) => string
    fetchViewItems: (
        ...args: Parameters<typeof viewsActions.fetchViewItems>
    ) => ReturnType<ReturnType<typeof viewsActions.fetchViewItems>>
    onItemClick?: (item: Map<any, any>) => void
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    rowCursor: number
}

class Table extends React.Component<Props, State> {
    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
        selectable: true,
    }

    state = {
        rowCursor: 0,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('View')
    }

    componentWillReceiveProps(nextProps: Props) {
        if (
            nextProps.selectedItemsIds &&
            nextProps.viewSelected &&
            nextProps.selectedItemsIds.size !== nextProps.items.size
        ) {
            nextProps.toggleViewSelection()
        }
        // new items loaded
        if (!nextProps.items.equals(this.props.items)) {
            this.setState({rowCursor: 0})
            if (nextProps.viewSelected) {
                nextProps.updatePageSelection(
                    nextProps.items.map(
                        (item: Map<any, any>) => item.get('id') as number
                    ) as List<any>
                )
            } else if (nextProps.selectedItemsIds) {
                nextProps.updatePageSelection(
                    nextProps.selectedItemsIds.filter((itemId) =>
                        nextProps.items.some(
                            (item: Map<any, any>) => item.get('id') === itemId
                        )
                    ) as List<any>
                )
            }
        }
    }

    _bindKeys() {
        shortcutManager.bind('View', {
            GO_NEXT_PAGE: {
                action: () => this._movePage(),
            },
            GO_PREV_PAGE: {
                action: () => this._movePage(ViewNavDirection.PrevView),
            },
            GO_NEXT_ROW: {
                action: () => this._moveCursor(),
            },
            GO_PREV_ROW: {
                action: () => this._moveCursor(MoveIndexDirection.Prev),
            },
            CHECK_ITEM: {
                action: () => {
                    const cursorId = this.props.items.getIn([
                        this.state.rowCursor,
                        'id',
                    ])
                    if (cursorId) {
                        this.props.toggleIdInPageSelection(cursorId)
                    }
                },
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
                },
            },
        })
    }

    _moveCursor = (direction: MoveIndexDirection = MoveIndexDirection.Next) => {
        this.setState({
            rowCursor: moveIndex(this.state.rowCursor, this.props.items.size, {
                direction,
            }),
        })
    }

    _toggleSelectAllPageItems = () => {
        const itemsIds = this.props.items.map(
            (item: Map<any, any>) => item.get('id') as number
        ) as List<any>
        if (
            this.props.selectedItemsIds &&
            this.props.selectedItemsIds.size > 0
        ) {
            this.props.updatePageSelection(List())
        } else {
            this.props.updatePageSelection(itemsIds)
        }
    }

    _movePage = (direction: ViewNavDirection = ViewNavDirection.NextView) => {
        const {navigation, fetchViewItems, isLoading} = this.props

        if (
            (direction === ViewNavDirection.PrevView &&
                !navigation.get('prev_items')) ||
            (direction === ViewNavDirection.NextView &&
                !navigation.get('next_items')) ||
            isLoading('fetchList')
        ) {
            return
        }

        void fetchViewItems(direction)
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
            onItemClick,
            getItemUrl,
            fetchViewItems,
            navigation,
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
                        {!isSearch ? (
                            <a
                                onClick={() => {
                                    resetView(config.get('name'))
                                    void fetchViewItems()
                                }}
                            >
                                Reset view
                            </a>
                        ) : null}
                    </p>
                )
            }

            return (
                <div>
                    <BlankState message={message} />
                    <Navigation
                        hasNextItems={!!navigation.get('next_items')}
                        hasPrevItems={!!navigation.get('prev_items')}
                        fetchNextItems={() =>
                            fetchViewItems(ViewNavDirection.NextView)
                        }
                        fetchPrevItems={() =>
                            fetchViewItems(ViewNavDirection.PrevView)
                        }
                    />
                </div>
            )
        }

        const areAllSelected =
            !!selectedItemsIds && items.size === selectedItemsIds.size
        const indeterminateCheckbox =
            !!selectedItemsIds &&
            selectedItemsIds.size > 0 &&
            selectedItemsIds.size < items.size
        return (
            <div>
                <table className={classnames(css.table, 'view-table')}>
                    <thead>
                        <tr>
                            {selectable ? (
                                <td
                                    className="cell-wrapper cell-short clickable d-none d-md-table-cell"
                                    onClick={this._toggleSelectAllPageItems}
                                >
                                    <input
                                        type="checkbox"
                                        checked={areAllSelected}
                                        ref={(el) =>
                                            el &&
                                            (el.indeterminate = indeterminateCheckbox)
                                        }
                                        readOnly
                                    />
                                </td>
                            ) : null}
                            {fields.map((field: Map<any, any>, index) => {
                                return (
                                    <HeaderCell
                                        key={field.get('name')}
                                        field={field}
                                        fields={fields}
                                        type={type}
                                        isLast={
                                            fields.size ===
                                            (index as number) + 1
                                        }
                                        isSearch={isSearch}
                                        ActionsComponent={ActionsComponent}
                                    />
                                )
                            })}
                        </tr>
                        {(!!navigation.get('next_items') ||
                            !!navigation.get('prev_items')) &&
                        areAllSelected &&
                        type === 'ticket' ? (
                            <ViewSelection
                                colSize={fields.size + 1}
                                selectedCount={items.size}
                                viewName={view.get('name')}
                                viewSelected={this.props.viewSelected}
                                onSelectViewClick={
                                    this.props.toggleViewSelection
                                }
                            />
                        ) : null}
                    </thead>
                    <tbody>
                        {items.map((item: Map<any, any>, index) => {
                            const id = item.get('id')

                            return (
                                <Row
                                    key={id}
                                    fields={fields}
                                    item={item}
                                    selectable={selectable}
                                    isSelected={
                                        !!selectedItemsIds &&
                                        selectedItemsIds.includes(id)
                                    }
                                    type={type}
                                    hasCursor={this.state.rowCursor === index}
                                    onItemClick={onItemClick}
                                    itemUrl={
                                        getItemUrl ? getItemUrl(item) : null
                                    }
                                />
                            )
                        })}
                    </tbody>
                </table>

                <Navigation
                    hasNextItems={!!navigation.get('next_items')}
                    hasPrevItems={!!navigation.get('prev_items')}
                    fetchNextItems={() =>
                        fetchViewItems(ViewNavDirection.NextView)
                    }
                    fetchPrevItems={() =>
                        fetchViewItems(ViewNavDirection.PrevView)
                    }
                />
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            viewSelected: areAllActiveViewItemsSelected(state),
        }
    },
    {
        toggleIdInPageSelection: viewsActions.toggleIdInSelectedItemsIds,
        updatePageSelection: viewsActions.updateSelectedItemsIds,
        toggleViewSelection: viewsActions.toggleViewSelection,
        resetView: viewsActions.resetView,
    }
)

export default connector(Table)
