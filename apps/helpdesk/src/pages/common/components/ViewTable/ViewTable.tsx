import type { ComponentType, ContextType, ReactNode } from 'react'
import { Component } from 'react'

import { tryLocalStorage } from '@repo/browser-storage'
import { FeatureFlagKey, withFeatureFlags } from '@repo/feature-flags'
import type { FeatureFlagsMap } from '@repo/feature-flags'
import { history } from '@repo/routing'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _isArray from 'lodash/isArray'
import { parse, stringify } from 'qs'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import type { RouteComponentProps } from 'react-router-dom'

import { getConfigByName } from 'config/views'
import type { ViewVisibility } from 'models/view/types'
import { EntityType, ViewType } from 'models/view/types'
import Loader from 'pages/common/components/Loader/Loader'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import { Separator } from 'pages/common/components/Separator/Separator'
import DeactivatedViewMessage from 'pages/common/components/ViewTable/DeactivatedViewMessage'
import FilterTopbar from 'pages/common/components/ViewTable/FilterTopbar'
import Header from 'pages/common/components/ViewTable/Header'
import Table from 'pages/common/components/ViewTable/Table'
import MissingBillingInformationRow from 'pages/common/components/ViewTable/Table/MissingBillingInformationRow'
import css from 'pages/common/components/ViewTable/ViewTable.less'
import type { ViewSearchUrlSyncInjectedProps } from 'pages/common/components/ViewTable/withViewSearchUrlSync'
import withViewSearchUrlSync from 'pages/common/components/ViewTable/withViewSearchUrlSync'
import { isCreationUrl } from 'pages/common/utils/url'
import type { CancellableRequestInjectedProps } from 'pages/common/utils/withCancellableRequest'
import withCancellableRequest from 'pages/common/utils/withCancellableRequest'
import withRouter from 'pages/common/utils/withRouter'
import type { RootState } from 'state/types'
import { activeViewIdSet } from 'state/ui/views/actions'
import { fetchViewItems, setViewActive, updateView } from 'state/views/actions'
import { SEARCH_VIEW_FIELD_CONFIG_STORAGE_KEY } from 'state/views/constants'
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

import { ViewTableHeaderContainer } from './ViewTableHeaderContainer'

type OwnProps = {
    className?: string
    type: EntityType
    items: List<any>
    isUpdate: boolean
    isSearch: boolean
    urlViewId: Maybe<string>
    ActionsComponent: Maybe<ComponentType>
    viewButtons: ReactNode
    hideHeader?: boolean
}

type Props = OwnProps &
    RouteComponentProps<
        { visibility: ViewVisibility },
        any,
        { viewName?: string; filters?: string }
    > &
    ViewSearchUrlSyncInjectedProps &
    ConnectedProps<typeof connector> &
    CancellableRequestInjectedProps<
        'fetchViewItemsCancellable',
        'cancelFetchViewItemsCancellable',
        typeof fetchViewItems
    > & { flags?: FeatureFlagsMap }

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
export class ViewTableContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'items' | 'type'> = {
        items: fromJS([]),
        type: EntityType.Ticket,
    }

    static contextType = SearchRankScenarioContext
    declare context: ContextType<typeof SearchRankScenarioContext>

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
            match: { params },
        } = this.props
        const viewType = config.get('type') as ViewType

        if (isSearch) {
            let fieldConfig: string[] | null = null
            tryLocalStorage(() => {
                const storedFieldConfig = localStorage.getItem(
                    SEARCH_VIEW_FIELD_CONFIG_STORAGE_KEY,
                )

                try {
                    const parsedFieldConfig = JSON.parse(
                        storedFieldConfig as string,
                    )

                    if (_isArray(parsedFieldConfig)) {
                        fieldConfig = parsedFieldConfig
                    }
                } catch {}
            })

            updateView(
                urlSearchView.merge(
                    !!fieldConfig ? { fields: fieldConfig } : {},
                ),
                false,
            )
        } else if (isCreationUrl(location.pathname, 'tickets')) {
            updateView(
                (
                    config.get('newView') as (
                        params?: ViewVisibility,
                        viewName?: string,
                        filters?: string,
                    ) => Map<any, any>
                )(
                    params.visibility,
                    location.state?.viewName,
                    location.state?.filters,
                ),
            )
            void fetchViewItemsCancellable(
                null,
                null,
                null,
                this.context,
                undefined,
            )
        } else if (activeView.isEmpty() || urlViewId) {
            const suggestedViewId = getViewIdToDisplay(viewType, urlViewId)

            const viewMissing =
                suggestedViewId &&
                urlViewId &&
                suggestedViewId.toString() !== urlViewId

            if (viewMissing) {
                history.push('/app')
            } else if (
                suggestedViewId &&
                !urlViewId &&
                viewType === ViewType.TicketList
            ) {
                history.push(
                    `/app/${config.get(
                        'routeList',
                    )}/${suggestedViewId.toString()}`,
                )
            }

            if (suggestedViewId && activeView.get('id') !== suggestedViewId) {
                setViewActive(getView(suggestedViewId.toString()))
            }

            activeViewIdSet(suggestedViewId)
        } else if (!isSearch && activeView.get('search') !== null) {
            const suggestedViewId = getViewIdToDisplay(viewType, undefined)
            // oxlint-disable-next-line no-unused-expressions
            suggestedViewId &&
                setViewActive(getView(suggestedViewId.toString()))
            activeViewIdSet(suggestedViewId)
        }

        void fetchViewItems(
            null,
            parse(location.search, { ignoreQueryPrefix: true })
                .cursor as string,
            null,
            this.context,
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
            match: { params },
            getView,
            hasActiveView,
            urlSearchView,
        } = this.props

        const prevSuggestedViewId = getViewIdToDisplay(
            prevProps.config.get('type'),
            prevProps.urlViewId,
        )
        const currentSuggestedViewId = getViewIdToDisplay(
            this.props.config.get('type'),
            this.props.urlViewId,
        )

        const urlCursor =
            (parse(location.search, { ignoreQueryPrefix: true })
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
                        params?: ViewVisibility,
                    ) => Map<any, any>
                )(params.visibility),
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
                const query = parse(location.search, {
                    ignoreQueryPrefix: true,
                })
                const cursorToSet = !isOnFirstPage ? storedCursor : null
                if (cursorToSet) {
                    query.cursor = cursorToSet
                    history.push({
                        ...location,
                        search: stringify(query),
                    } as any)
                } else if (query.cursor) {
                    delete query.cursor
                    history.push({
                        ...location,
                        search: stringify(query),
                    } as any)
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
                    undefined,
                )
            }
        }

        if (shouldFetchViewItems) {
            return fetchViewItemsCancellable(
                null,
                null,
                null,
                this.context,
                undefined,
            )
        }
    }

    _getItemUrl = (item: Map<any, any>): string => {
        const { activeView, config, flags } = this.props
        if (!config) {
            return ''
        }

        if (
            flags?.[FeatureFlagKey.RedirectDeprecatedTicketRoutes] &&
            config.get('routeItem') === 'ticket'
        ) {
            const activeViewId = activeView.get('id') as number | undefined
            const viewId = activeViewId || 0
            const ticketId = item.get('id') as number
            return `/app/tickets/${viewId}/${ticketId}`
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
        const { activeView, isSearch, isUpdate, type, className, hideHeader } =
            this.props
        const hasFilters = type === EntityType.Ticket

        if (activeView.isEmpty()) {
            return <Loader />
        }

        return (
            <div className={classnames(css.page, className)}>
                {!hideHeader && (
                    <ViewTableHeaderContainer>
                        <Header
                            isSearch={isSearch}
                            isUpdate={isUpdate}
                            type={type}
                            viewButtons={this.props.viewButtons}
                        />
                    </ViewTableHeaderContainer>
                )}
                {hasFilters && (activeView.get('editMode') || isSearch) && (
                    <>
                        <Separator />
                        <FilterTopbar
                            isUpdate={isUpdate}
                            isSearch={isSearch}
                            type={type}
                            activeView={activeView}
                        />
                    </>
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
    },
)

export default withRouter(
    withCancellableRequest<
        'fetchViewItemsCancellable',
        'cancelFetchViewItemsCancellable',
        typeof fetchViewItems
    >(
        'fetchViewItemsCancellable',
        fetchViewItems,
    )(connector(withViewSearchUrlSync(withFeatureFlags(ViewTableContainer)))),
)
