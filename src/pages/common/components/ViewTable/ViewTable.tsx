import React, {ComponentType, ReactNode} from 'react'
import {fromJS, List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {browserHistory, withRouter, WithRouterProps} from 'react-router'
import classnames from 'classnames'
import _get from 'lodash/get'

import Loader from '../Loader/index.js'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../common/utils/withCancellableRequest'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as viewsConfig from '../../../../config/views'
import {RootState} from '../../../../state/types'

import Header from './Header'
import Table from './Table'
import FilterTopbar from './FilterTopbar'
import DeactivatedViewMessage from './DeactivatedViewMessage'
import css from './ViewTable.less'

type OwnProps = {
    className?: string
    type: string
    items: List<any>
    isUpdate: boolean
    isSearch: boolean
    urlViewId: Maybe<string>
    ActionsComponent: Maybe<ComponentType>
    viewButtons: ReactNode
} & CancellableRequestInjectedProps<
    'fetchViewItemsCancellable',
    'cancelFetchViewItemsCancellable',
    typeof viewsActions.fetchViewItems
>

type Props = OwnProps &
    WithRouterProps<any, {cursor?: string; q?: string}> &
    ConnectedProps<typeof connector>

export class ViewTableContainer extends React.Component<Props> {
    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
    }

    componentDidMount() {
        const {
            getViewIdToDisplay,
            config,
            urlViewId,
            setViewActive,
            getView,
            location,
            fetchViewItems,
            activeView,
            updateView,
            isSearch,
        } = this.props

        if (isSearch) {
            updateView(
                (config.get('searchView') as (query: string) => Map<any, any>)(
                    this._searchQuery(this.props)
                ),
                false
            )
        } else if (activeView.isEmpty() || urlViewId) {
            const suggestedViewId = getViewIdToDisplay(
                config.get('type'),
                urlViewId
            )

            const viewMissing =
                suggestedViewId &&
                urlViewId &&
                suggestedViewId.toString() !== urlViewId
            if (viewMissing) {
                browserHistory.push('/app')
            }

            setViewActive(getView((suggestedViewId as unknown) as string))
        }

        void fetchViewItems(null, location.query.cursor)
    }

    componentWillReceiveProps(nextProps: Props) {
        const {
            getViewIdToDisplay,
            fetchViewItemsCancellable,
            updateView,
            setViewActive,
            getView,
            isLoading: wasLoading,
            isUpdate: wasUpdate,
            isSearch: wasSearch,
            activeView: previousView,
        } = this.props
        const {
            config,
            navigation,
            location,
            isLoading,
            isUpdate,
            isSearch,
            isOnFirstPage,
            activeView,
        } = nextProps

        const currentSuggestedViewId = getViewIdToDisplay(
            this.props.config.get('type'),
            this.props.urlViewId
        )
        const nextSuggestedViewId = getViewIdToDisplay(
            nextProps.config.get('type'),
            nextProps.urlViewId
        )

        const urlCursor = location.query.cursor || null
        const storedCursor = navigation.get('current_cursor') || null
        const cursorAreDifferent = urlCursor !== storedCursor

        const justFinishedFetching =
            wasLoading('fetchList') && !isLoading('fetchList')
        const wasDeactivated =
            previousView && !!previousView.get('deactivated_datetime')
        const isDeactivated =
            activeView && !!activeView.get('deactivated_datetime')
        const previousId = previousView ? previousView.get('id') : null
        const currentId = activeView ? activeView.get('id') : null
        const idChanged = previousId !== currentId

        const leavingSearchMode = wasSearch && !isSearch
        const leavingAddNewMode = !wasUpdate && isUpdate
        const leavingDeactivatedMode = wasDeactivated && !isDeactivated
        const suggestedViewChanged =
            currentSuggestedViewId !== nextSuggestedViewId
        const noActiveView = !nextProps.hasActiveView

        let shouldFetchViewItems = false

        if (!wasSearch && isSearch) {
            // entering "search" mode
            updateView(
                (config.get('searchView') as (query: string) => Map<any, any>)(
                    this._searchQuery(nextProps)
                ),
                false
            )
            shouldFetchViewItems = true
        } else if (wasUpdate && !isUpdate) {
            // entering "add new" mode
            updateView((config.get('newView') as () => Map<any, any>)())
            shouldFetchViewItems = true
        } else if (
            isSearch &&
            this._searchQuery(this.props) !== this._searchQuery(nextProps)
        ) {
            // in "search" mode, if search query has changed, research again
            updateView(
                (config.get('searchView') as (query: string) => Map<any, any>)(
                    this._searchQuery(nextProps)
                ),
                false
            )
            shouldFetchViewItems = true
        } else if (
            leavingSearchMode ||
            leavingAddNewMode ||
            suggestedViewChanged ||
            noActiveView
        ) {
            setViewActive(getView((nextSuggestedViewId as unknown) as string))
            shouldFetchViewItems = true
        } else if (leavingDeactivatedMode && !idChanged) {
            shouldFetchViewItems = true
        }

        if (cursorAreDifferent) {
            if (justFinishedFetching) {
                // if the stored cursor has changed after a fetch, update the cursor in the URL
                const query = location.query
                const cursorToSet = !isOnFirstPage ? storedCursor : null

                if (cursorToSet) {
                    query.cursor = cursorToSet
                    browserHistory.push({...location, query})
                } else if (query.cursor) {
                    delete query.cursor
                    browserHistory.push({...location, query})
                }
            } else if (
                !isLoading('fetchList') &&
                (urlCursor || !isOnFirstPage)
            ) {
                // This happens when loading a page directly with a cursor in the URL.
                // It can also happen when switching between two non-first pages, but in this case we don't want to
                // trigger a fetch until the current fetch is over
                return fetchViewItemsCancellable(null, urlCursor, null)
            }
        }

        if (shouldFetchViewItems) {
            return fetchViewItemsCancellable(null, null, null)
        }
    }

    _searchQuery = (props: Props = this.props) => {
        return _get(props, 'location.query.q', '') as string
    }

    _getItemUrl = (item: Map<any, any>): string => {
        const {config} = this.props
        if (!config) {
            return ''
        }

        return `/app/${config.get('routeItem') as string}/${
            (item.get('id') as unknown) as number
        }`
    }

    _renderTable = () => {
        const {
            ActionsComponent,
            type,
            items,
            config,
            isSearch,
            activeView,
            isLoading,
            selectedItemsIds,
            fetchViewItems,
            navigation,
        } = this.props

        const displayedFields = (config.get('fields', fromJS([])) as List<
            any
        >).filter((field: Map<any, any>) => {
            // display field if mandatory from config
            if (config.get('mainField') === field.get('name')) {
                return true
            }

            return (activeView.get('fields', fromJS([])) as List<any>).contains(
                field.get('name')
            )
        })

        if (activeView.get('deactivated_datetime')) {
            return <DeactivatedViewMessage />
        }

        return (
            <Table
                view={activeView}
                config={config}
                isLoading={isLoading}
                navigation={navigation}
                selectedItemsIds={selectedItemsIds}
                type={type}
                items={items}
                fields={displayedFields as List<any>}
                isSearch={isSearch}
                ActionsComponent={ActionsComponent}
                getItemUrl={this._getItemUrl}
                fetchViewItems={fetchViewItems}
            />
        )
    }

    render() {
        const {activeView, isSearch, isUpdate, type, className} = this.props

        if (activeView.isEmpty()) {
            return <Loader />
        }

        return (
            <div className={classnames(css.page, className)}>
                <div className="container-padding">
                    <Header
                        isSearch={isSearch}
                        isUpdate={isUpdate}
                        type={type}
                        viewButtons={this.props.viewButtons}
                    />
                </div>
                <FilterTopbar
                    isUpdate={isUpdate}
                    isSearch={isSearch}
                    type={type}
                />
                <div className={css.table}>{this._renderTable()}</div>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState, ownProps: OwnProps) => {
        const config = viewsConfig.getConfigByName(ownProps.type)

        return {
            activeView: viewsSelectors.getActiveView(state),
            config,
            getView: viewsSelectors.makeGetView(state),
            getViewIdToDisplay: viewsSelectors.makeGetViewIdToDisplay(state),
            hasActiveView: viewsSelectors.hasActiveViewOfType(
                config.get('type')
            )(state),
            isLoading: viewsSelectors.makeIsLoading(state),
            isOnFirstPage: viewsSelectors.isOnFirstPage(state),
            navigation: viewsSelectors.getNavigation(state),
            selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
        }
    },
    {
        fetchViewItems: viewsActions.fetchViewItems,
        setViewActive: viewsActions.setViewActive,
        updateView: viewsActions.updateView,
    }
)

export default withRouter(
    withCancellableRequest<
        'fetchViewItemsCancellable',
        'cancelFetchViewItemsCancellable',
        typeof viewsActions.fetchViewItems
    >(
        'fetchViewItemsCancellable',
        viewsActions.fetchViewItems
    )(connector(ViewTableContainer))
)
