import cn from 'classnames'
import {fromJS, List, Map} from 'immutable'
import React, {ReactNode, useContext, useEffect, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {useDesktopOnlyShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import usePrevious from 'hooks/usePrevious'
import {EntityType} from 'models/view/types'

import BlankState from 'pages/common/components/BlankState/BlankState'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import css from 'pages/common/components/ViewTable/Table.less'
import HeaderCell from 'pages/common/components/ViewTable/Table/HeaderCell'
import Row from 'pages/common/components/ViewTable/Table/Row'
import ViewSelection from 'pages/common/components/ViewTable/Table/ViewSelection'
import CheckBox from 'pages/common/forms/CheckBox'
import {moveIndex, MoveIndexDirection} from 'pages/common/utils/keyboard'
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

type OwnProps = {
    headerRow?: ReactNode
    view: ViewImmutable
    config: Map<any, any>
    isLoading: (list: string) => boolean
    isSearch: boolean
    selectable?: boolean
    navigation: Map<any, any>
    selectedItemsIds?: List<any>
    type: EntityType
    items: List<any>
    fields: List<any>
    ActionsComponent?: Maybe<React.ComponentType>
    getItemUrl?: (item: Map<any, any>) => string
    fetchViewItems: (
        ...args: Parameters<typeof fetchViewItems>
    ) => Promise<unknown> | void
    onItemClick?: (item: Map<any, any>) => void
    shouldRenderShowMoreDropdown?: boolean
    areHeaderCellsClickable?: boolean
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
    type = EntityType.Ticket,
    updatePageSelection,
    view,
    viewSelected,
    shouldRenderShowMoreDropdown = true,
    areHeaderCellsClickable = true,
}: Props) => {
    const hasNextItems =
        !!navigation.get('next_items') || !!navigation.get('next_cursor')
    const hasPrevItems =
        !!navigation.get('prev_items') || !!navigation.get('prev_cursor')
    const prevItems = usePrevious(items)
    const [rowCursor, setRowCursor] = useState(0)
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const isTrackTotalHitsEnabled = useFlag(FeatureFlagKey.TrackTotalSearchHits)
    const searchRank = useContext(SearchRankScenarioContext)
    const orderBy = view.get('order_by') as string
    const fetchParams = useMemo(
        () =>
            orderBy
                ? {orderBy: `${orderBy}:${view.get('order_dir') as string}`}
                : undefined,
        [orderBy, view]
    ) as FetchViewItemsOptions
    const searchOptions = useMemo(
        () =>
            isTrackTotalHitsEnabled && isSearch && type === EntityType.Ticket
                ? {trackTotalHits: true}
                : undefined,
        [isTrackTotalHitsEnabled, isSearch, type]
    )
    const navigationFetchParams = useMemo(
        () => ({...fetchParams, ...searchOptions}),
        [fetchParams, searchOptions]
    )

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
            <table
                className={cn(
                    css.table,
                    'view-table',
                    /* istanbul ignore next */
                    showGlobalNav && css.globalNavStyles
                )}
            >
                <thead className={css.tableHead}>
                    <tr>
                        {selectable ? (
                            <td
                                className={cn(
                                    'cell-wrapper clickable d-none d-md-table-cell smallest',
                                    /* istanbul ignore next */
                                    showGlobalNav
                                        ? 'cell-global-nav'
                                        : 'cell-short'
                                )}
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
                                    shouldRenderShowMoreDropdown={
                                        fields.size === (index as number) + 1 &&
                                        shouldRenderShowMoreDropdown
                                    }
                                    isClickable={areHeaderCellsClickable}
                                    isSearch={isSearch}
                                    ActionsComponent={ActionsComponent}
                                />
                            )
                        })}
                    </tr>
                    {(!!navigation.get('next_items') ||
                        !!navigation.get('prev_items')) &&
                    areAllSelected &&
                    type === EntityType.Ticket ? (
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
                        navigationFetchParams
                    )
                }
                fetchPrevItems={() =>
                    fetchViewItems(
                        ViewNavDirection.PrevView,
                        null,
                        null,
                        searchRank,
                        navigationFetchParams
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
