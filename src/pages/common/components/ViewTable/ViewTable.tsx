import React, {Component, ComponentType, ContextType, ReactNode} from 'react'
import {fromJS, List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps} from 'react-router-dom'
import classnames from 'classnames'
import {parse, stringify} from 'qs'
import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import {WITH_HIGHLIGHTS_OPTION_KEY} from 'constants/view'
import {FeatureFlagKey} from 'config/featureFlags'

import {getConfigByName} from 'config/views'
import {EntityType, ViewVisibility} from 'models/view/types'
import Loader from 'pages/common/components/Loader/Loader'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import {isCreationUrl} from 'pages/common/utils/url'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from 'pages/common/utils/withCancellableRequest'
import history from 'pages/history'
import {RootState} from 'state/types'
import {activeViewIdSet} from 'state/ui/views/actions'
import {fetchViewItems, setViewActive, updateView} from 'state/views/actions'
import {
    getActiveView,
    getNavigation,
    getSelectedItemsIds,
    getViewIdToDisplay,
    hasActiveViewOfType,
    isOnFirstPage,
    makeGetView,
    makeIsLoading,
} from 'state/views/selectors'
import withRouter from 'pages/common/utils/withRouter'

import FilterTopbar from 'pages/common/components/ViewTable/FilterTopbar'
import DeactivatedViewMessage from 'pages/common/components/ViewTable/DeactivatedViewMessage'
import Header from 'pages/common/components/ViewTable/Header'
import Table from 'pages/common/components/ViewTable/Table'
import MissingBillingInformationRow from 'pages/common/components/ViewTable/Table/MissingBillingInformationRow'
import css from 'pages/common/components/ViewTable/ViewTable.less'
import withViewSearchUrlSync, {
    ViewSearchUrlSyncInjectedProps,
} from 'pages/common/components/ViewTable/withViewSearchUrlSync'

type OwnProps = {
    className?: string
    type: EntityType
    items: List<any>
    isUpdate: boolean
    isSearch: boolean
    urlViewId: Maybe<string>
    ActionsComponent: Maybe<ComponentType>
    viewButtons: ReactNode
    flags: LDFlagSet
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
        typeof fetchViewItems
    >

export class ViewTableContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'items' | 'type'> = {
        items: fromJS([]),
        type: EntityType.Ticket,
    }

    static contextType = SearchRankScenarioContext
    context!: ContextType<typeof SearchRankScenarioContext>

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
            updateView(
                urlSearchView.merge({
                    [WITH_HIGHLIGHTS_OPTION_KEY]:
                        this._isAdvancedSearchWithHighlights(),
                }),
                false
            )
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
            void fetchViewItemsCancellable(
                null,
                null,
                null,
                this.context,
                undefined
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
                history.push('/app')
            } else if (suggestedViewId && !urlViewId) {
                history.push(`/app/tickets/${suggestedViewId.toString()}`)
            }

            if (suggestedViewId && activeView.get('id') !== suggestedViewId) {
                setViewActive(getView(suggestedViewId.toString()))
            }

            activeViewIdSet(suggestedViewId)
        } else if (!isSearch && activeView.get('search') !== null) {
            const suggestedViewId = getViewIdToDisplay(
                config.get('type'),
                undefined
            )
            suggestedViewId &&
                setViewActive(getView(suggestedViewId.toString()))
            activeViewIdSet(suggestedViewId)
        }

        void fetchViewItems(
            null,
            parse(location.search, {ignoreQueryPrefix: true}).cursor as string,
            null,
            this.context
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

        const urlCursor =
            (parse(location.search, {ignoreQueryPrefix: true})
                .cursor as string) || null
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
                return fetchViewItemsCancellable(
                    null,
                    urlCursor,
                    null,
                    this.context,
                    undefined
                )
            }
        }

        if (shouldFetchViewItems) {
            return fetchViewItemsCancellable(
                null,
                null,
                null,
                this.context,
                undefined
            )
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

    _isAdvancedSearchWithHighlights = () =>
        this.props.flags?.[FeatureFlagKey.AdvancedSearchWithHighlights] !==
        false

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

        const displayedFields = (config.get('fields', fromJS([])) as List<any>)
            .filter((field: Map<any, any>) => {
                // display field if mandatory from config
                if (config.get('mainField') === field.get('name')) {
                    return true
                }

                return (
                    activeView.get('fields', fromJS([])) as List<any>
                ).contains(field.get('name'))
            })
            .toList()

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
                fields={displayedFields}
                isSearch={isSearch}
                ActionsComponent={ActionsComponent}
                getItemUrl={this._getItemUrl}
                fetchViewItems={fetchViewItems}
            />
        )
    }

    render() {
        const {activeView, isSearch, isUpdate, type, className} = this.props
        const hasFilters =
            type === EntityType.Ticket ||
            type === EntityType.TicketWithHighlight

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
                {hasFilters && (activeView.get('editMode') || isSearch) && (
                    <FilterTopbar
                        isUpdate={isUpdate}
                        isSearch={isSearch}
                        type={type}
                        activeView={activeView}
                    />
                )}
                <div className={css.table}>{this._renderTable()}</div>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState, ownProps: OwnProps) => {
        const config = getConfigByName(ownProps.type)

        return {
            activeView: getActiveView(state),
            config,
            getView: makeGetView(state),
            getViewIdToDisplay: getViewIdToDisplay(state),
            hasActiveView: hasActiveViewOfType(config.get('type'))(state),
            isLoading: makeIsLoading(state),
            isOnFirstPage: isOnFirstPage(state),
            navigation: getNavigation(state),
            selectedItemsIds: getSelectedItemsIds(state),
        }
    },
    {
        activeViewIdSet,
        fetchViewItems,
        setViewActive,
        updateView,
    }
)

export default withRouter(
    withCancellableRequest<
        'fetchViewItemsCancellable',
        'cancelFetchViewItemsCancellable',
        typeof fetchViewItems
    >(
        'fetchViewItemsCancellable',
        fetchViewItems
    )(connector(withViewSearchUrlSync(withLDConsumer()(ViewTableContainer))))
)
