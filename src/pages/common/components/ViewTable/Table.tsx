import React, {ReactNode, useContext, useEffect, useMemo, useState} from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {usePrevious} from 'react-use'

import BlankState from 'pages/common/components/BlankState/BlankState'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import {moveIndex, MoveIndexDirection} from 'pages/common/utils/keyboard'
import CheckBox from 'pages/common/forms/CheckBox'
import history from 'pages/history'
import shortcutManager from 'services/shortcutManager'
import {RootState} from 'state/types'
import {
    toggleViewSelection,
    toggleIdInSelectedItemsIds,
    updateSelectedItemsIds,
    resetView,
    fetchViewItems,
} from 'state/views/actions'
import {areAllActiveViewItemsSelected} from 'state/views/selectors'
import {
    FetchViewItemsOptions,
    ViewImmutable,
    ViewNavDirection,
} from 'state/views/types'

import HeaderCell from './Table/HeaderCell'
import Row from './Table/Row'
import ViewSelection from './Table/ViewSelection'
import css from './Table.less'

type OwnProps = {
    headerRow?: ReactNode
    view: ViewImmutable
    config: Map<any, any>
    isLoading: (list: string) => boolean
    isSearch: boolean
    selectable?: boolean
    navigation: Map<any, any>
    selectedItemsIds?: List<any>
    type: string
    items: List<any>
    fields: List<any>
    ActionsComponent?: Maybe<React.ComponentType>
    getItemUrl?: (item: Map<any, any>) => string
    fetchViewItems: (
        ...args: Parameters<typeof fetchViewItems>
    ) => Promise<unknown> | void
    onItemClick?: (item: Map<any, any>) => void
}

type Props = OwnProps & ConnectedProps<typeof connector>

const TableContainer = ({
    ActionsComponent,
    headerRow,
    config,
    fetchViewItems,
    fields,
    isLoading,
    isSearch,
    items = fromJS([]),
    getItemUrl,
    navigation,
    onItemClick,
    resetView,
    selectable = true,
    selectedItemsIds,
    toggleIdInPageSelection,
    toggleViewSelection,
    type = 'ticket',
    updatePageSelection,
    view,
    viewSelected,
}: Props) => {
    const hasNextItems =
        !!navigation.get('next_items') || !!navigation.get('next_cursor')
    const hasPrevItems =
        !!navigation.get('prev_items') || !!navigation.get('prev_cursor')
    const prevItems = usePrevious(items)
    const [rowCursor, setRowCursor] = useState(0)
    const searchRank = useContext(SearchRankScenarioContext)
    const orderBy = view.get('order_by') as string
    const fetchParams = useMemo(
        () =>
            orderBy
                ? {orderBy: `${orderBy}:${view.get('order_dir') as string}`}
                : undefined,
        [orderBy, view]
    ) as FetchViewItemsOptions

    const areAllSelected = useMemo(
        () => !!selectedItemsIds && items.size === selectedItemsIds.size,
        [items, selectedItemsIds]
    )

    const indeterminateCheckbox = useMemo(
        () =>
            !!selectedItemsIds &&
            selectedItemsIds.size > 0 &&
            selectedItemsIds.size < items.size,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedItemsIds]
    )

    const moveCursor = (
        direction: MoveIndexDirection = MoveIndexDirection.Next
    ) => {
        setRowCursor(
            moveIndex(rowCursor, items.size, {
                direction,
            })
        )
    }

    const movePage = (
        direction: ViewNavDirection = ViewNavDirection.NextView
    ) => {
        if (
            (direction === ViewNavDirection.PrevView &&
                !navigation.get('prev_items')) ||
            (direction === ViewNavDirection.NextView &&
                !navigation.get('next_items')) ||
            isLoading('fetchList')
        ) {
            return
        }

        void fetchViewItems(direction, null, null, searchRank, fetchParams)
    }

    useEffect(() => {
        shortcutManager.bind('View', {
            GO_NEXT_PAGE: {
                action: () => movePage(),
            },
            GO_PREV_PAGE: {
                action: () => movePage(ViewNavDirection.PrevView),
            },
            GO_NEXT_ROW: {
                action: () => moveCursor(),
            },
            GO_PREV_ROW: {
                action: () => moveCursor(MoveIndexDirection.Prev),
            },
            CHECK_ITEM: {
                action: () => {
                    const cursorId = items.getIn([rowCursor, 'id'])
                    if (cursorId) {
                        toggleIdInPageSelection(cursorId)
                    }
                },
            },
            OPEN_ITEM: {
                action: (e) => {
                    e.preventDefault()
                    const item = items.get(rowCursor)
                    if (!item) {
                        return
                    }
                    searchRank?.registerResultSelection({
                        id: (item as Map<any, any>).get('id'),
                        index: rowCursor,
                    })
                    if (onItemClick) {
                        onItemClick(item)
                    } else if (getItemUrl) {
                        history.push(getItemUrl(item))
                    }
                },
            },
        })
        return () => {
            shortcutManager.unbind('View')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moveCursor, movePage])

    useEffect(() => {
        if (
            selectedItemsIds &&
            viewSelected &&
            selectedItemsIds.size !== items.size
        ) {
            toggleViewSelection()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.size, selectedItemsIds, viewSelected])

    useEffect(() => {
        if (prevItems && !prevItems.equals(items)) {
            setRowCursor(0)
            if (viewSelected) {
                updatePageSelection(
                    items.map(
                        (item: Map<any, any>) => item.get('id') as number
                    ) as List<any>
                )
            } else if (selectedItemsIds) {
                updatePageSelection(
                    selectedItemsIds.filter((itemId) =>
                        items.some(
                            (item: Map<any, any>) => item.get('id') === itemId
                        )
                    ) as List<any>
                )
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, prevItems])

    const toggleSelectAllPageItems = () => {
        const itemsIds = items.map(
            (item: Map<any, any>) => item.get('id') as number
        ) as List<any>
        if (selectedItemsIds && selectedItemsIds.size > 0) {
            updatePageSelection(List())
        } else {
            updatePageSelection(itemsIds)
        }
    }

    if (isLoading('fetchList')) {
        return <Loader />
    }

    if (items.isEmpty()) {
        return (
            <div>
                <BlankState
                    message={
                        view.get('dirty') ? (
                            <p>
                                No {config.get('singular')} found.
                                <br />
                                {!isSearch ? (
                                    <a
                                        className={css.link}
                                        onClick={() => {
                                            resetView(config.get('name'))
                                            void fetchViewItems()
                                        }}
                                    >
                                        Reset view
                                    </a>
                                ) : null}
                            </p>
                        ) : null
                    }
                />
                <div className="pl-4 mb-4">
                    <Navigation
                        className={css.navigation}
                        hasNextItems={hasNextItems}
                        hasPrevItems={hasPrevItems}
                        fetchNextItems={() =>
                            fetchViewItems(ViewNavDirection.NextView)
                        }
                        fetchPrevItems={() =>
                            fetchViewItems(ViewNavDirection.PrevView)
                        }
                    />
                </div>
            </div>
        )
    }

    return (
        <div>
            <table className={classnames(css.table, 'view-table')}>
                <thead>
                    <tr>
                        {selectable ? (
                            <td
                                className="cell-wrapper cell-short clickable d-none d-md-table-cell smallest"
                                onClick={toggleSelectAllPageItems}
                            >
                                <CheckBox
                                    labelClassName={css.checkBoxLabel}
                                    className={css.checkBox}
                                    isChecked={areAllSelected}
                                    isIndeterminate={indeterminateCheckbox}
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
                                        fields.size === (index as number) + 1
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
                            viewSelected={viewSelected}
                            onSelectViewClick={toggleViewSelection}
                        />
                    ) : null}
                </thead>
                <tbody>
                    {headerRow}
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
                                hasCursor={rowCursor === index}
                                onItemClick={(item) => {
                                    searchRank?.registerResultSelection({
                                        id: item.get('id'),
                                        index: index as number,
                                    })
                                    onItemClick?.(item)
                                }}
                                itemUrl={getItemUrl ? getItemUrl(item) : null}
                            />
                        )
                    })}
                </tbody>
            </table>

            <Navigation
                className={css.navigation}
                hasNextItems={hasNextItems}
                hasPrevItems={hasPrevItems}
                fetchNextItems={() =>
                    fetchViewItems(
                        ViewNavDirection.NextView,
                        null,
                        null,
                        searchRank,
                        fetchParams
                    )
                }
                fetchPrevItems={() =>
                    fetchViewItems(
                        ViewNavDirection.PrevView,
                        null,
                        null,
                        searchRank,
                        fetchParams
                    )
                }
            />
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        viewSelected: areAllActiveViewItemsSelected(state),
    }),
    {
        resetView,
        toggleIdInPageSelection: toggleIdInSelectedItemsIds,
        toggleViewSelection,
        updatePageSelection: updateSelectedItemsIds,
    }
)

export default connector(TableContainer)
