import React, {Component, ComponentType, ReactNode} from 'react'
import {fromJS, List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import classnames from 'classnames'
import {parse, stringify} from 'qs'

import Loader from '../Loader/Loader'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../common/utils/withCancellableRequest'
import {ViewVisibility} from '../../../../models/view/types'
import {activeViewIdSet} from '../../../../state/ui/views/actions'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as viewsConfig from '../../../../config/views'
import {RootState} from '../../../../state/types'
import history from '../../../history'
import {isCreationUrl} from '../../utils/url'

import Header from './Header'
import Table from './Table'
import FilterTopbar from './FilterTopbar'
import DeactivatedViewMessage from './DeactivatedViewMessage'
import css from './ViewTable.less'
import withViewSearchUrlSync, {
    ViewSearchUrlSyncInjectedProps,
} from './withViewSearchUrlSync'
import MissingBillingInformationRow from './Table/MissingBillingInformationRow'

type OwnProps = {
    className?: string
    type: 'ticket' | 'customer'
    items: List<any>
    isUpdate: boolean
    isSearch: boolean
    urlViewId: Maybe<string>
    ActionsComponent: Maybe<ComponentType>
    viewButtons: ReactNode
}

type Props = OwnProps &
    RouteComponentProps<
        {visibility: ViewVisibility},
        any,
        {viewName?: string; filters?: string}
    > &
    ViewSearchUrlSyncInjectedProps &
    ConnectedProps<typeof connector> &
    CancellableRequestInjectedProps<
        'fetchViewItemsCancellable',
        'cancelFetchViewItemsCancellable',
        typeof viewsActions.fetchViewItems
    >

export class ViewTableContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'items' | 'type'> = {
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
            fetchViewItems,
            fetchViewItemsCancellable,
            activeView,
            isSearch,
            location,
            urlSearchView,
            updateView,
            activeViewIdSet,
            match: {params},
        } = this.props

        if (isSearch) {
            updateView(urlSearchView, false)
        } else if (isCreationUrl(location.pathname, 'tickets')) {
            updateView(
                (
                    config.get('newView') as (
                        params?: ViewVisibility,
                        viewName?: string,
                        filters?: string
                    ) => Map<any, any>
                )(
                    params.visibility,
                    location.state?.viewName,
                    location.state?.filters
                )
            )
            void fetchViewItemsCancellable(null, null, null)
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
                history.push('/app')
            }

            setViewActive(getView(suggestedViewId as unknown as string))
            activeViewIdSet(suggestedViewId)
        }

        void fetchViewItems(
            null,
            parse(location.search, {ignoreQueryPrefix: true}).cursor as string
        )
    }

    componentDidUpdate(prevProps: Props) {
        const {
            config,
            navigation,
            location,
            isLoading,
            isUpdate,
            isSearch,
            isOnFirstPage,
            activeView,
            getViewIdToDisplay,
            fetchViewItemsCancellable,
            updateView,
            setViewActive,
            match: {params},
            getView,
            hasActiveView,
            urlSearchView,
        } = this.props

        const prevSuggestedViewId = getViewIdToDisplay(
            prevProps.config.get('type'),
            prevProps.urlViewId
        )
        const currentSuggestedViewId = getViewIdToDisplay(
            this.props.config.get('type'),
            this.props.urlViewId
        )

        const urlCursor = (parse(location.search).cursor as string) || null
        const storedCursor = navigation.get('current_cursor') || null

        let shouldFetchViewItems = false

        if (!prevProps.isSearch && isSearch) {
            // entering "search" mode
            updateView(urlSearchView, false)
            shouldFetchViewItems = true
        } else if (
            (prevProps.isUpdate && !isUpdate) ||
            (params.visibility &&
                params.visibility !== prevProps.match.params.visibility)
        ) {
            // entering "add new" mode
            updateView(
                (
                    config.get('newView') as (
                        params?: ViewVisibility
                    ) => Map<any, any>
                )(params.visibility)
            )
            shouldFetchViewItems = true
        } else if (
            isSearch &&
            prevProps.activeView.get('search') !== activeView.get('search')
        ) {
            shouldFetchViewItems = true
        } else if (
            (prevProps.isSearch && !isSearch) ||
            (!prevProps.isUpdate && isUpdate) ||
            prevSuggestedViewId !== currentSuggestedViewId ||
            !hasActiveView
        ) {
            setViewActive(getView(currentSuggestedViewId as unknown as string))
            activeViewIdSet(currentSuggestedViewId)
            shouldFetchViewItems = true
        } else if (
            !!prevProps.activeView.get('deactivated_datetime') &&
            !activeView.get('deactivated_datetime') &&
            prevProps.activeView.get('id') === activeView.get('id')
        ) {
            shouldFetchViewItems = true
        }

        if (urlCursor !== storedCursor) {
            if (prevProps.isLoading('fetchList') && !isLoading('fetchList')) {
                // if the stored cursor has changed after a fetch, update the cursor in the URL
                const query = parse(location.search, {ignoreQueryPrefix: true})
                const cursorToSet = !isOnFirstPage ? storedCursor : null
                if (cursorToSet) {
                    query.cursor = cursorToSet
                    history.push({...location, search: stringify(query)} as any)
                } else if (query.cursor) {
                    delete query.cursor
                    history.push({...location, search: stringify(query)} as any)
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

    _getItemUrl = (item: Map<any, any>): string => {
        const {config} = this.props
        if (!config) {
            return ''
        }

        return `/app/${config.get('routeItem') as string}/${
            item.get('id') as unknown as number
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

        const displayedFields = (
            config.get('fields', fromJS([])) as List<any>
        ).filter((field: Map<any, any>) => {
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
                headerRow={<MissingBillingInformationRow />}
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
        activeViewIdSet,
    }
)

export default withRouter<any, any>(
    withCancellableRequest<
        'fetchViewItemsCancellable',
        'cancelFetchViewItemsCancellable',
        typeof viewsActions.fetchViewItems
    >(
        'fetchViewItemsCancellable',
        viewsActions.fetchViewItems
    )(connector(withViewSearchUrlSync(ViewTableContainer)))
)
