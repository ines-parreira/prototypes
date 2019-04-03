// @flow
import React from 'react'
import {fromJS, Map, List} from 'immutable'
import {connect} from 'react-redux'
import {browserHistory, withRouter} from 'react-router'
import classnames from 'classnames'
import _get from 'lodash/get'

import Loader from '../Loader'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as viewsConfig from '../../../../config/views'
import type {viewType} from '../../../../state/views/types'

import Header from './Header'
import Table from './Table'
import FilterTopbar from './FilterTopbar'



import css from './ViewTable.less'


type Props = {
    ActionsComponent: ?() => {},
    activeView: viewType,
    config: Map<*,*>,
    currentCursor: string,
    fetchViewItems: typeof viewsActions.fetchViewItems,
    getViewIdToDisplay: typeof viewsSelectors.getViewIdToDisplay,
    getView: typeof viewsSelectors.getView,
    hasActiveView: boolean,

    isLoading: (string) => boolean,
    isOnFirstPage: boolean,
    navigation: Map<*,*>,
    selectedItemsIds: List<*>,

    location: Object,

    isSearch: boolean,
    isUpdate: boolean,
    items: List<*>,
    setViewActive: typeof viewsActions.setViewActive,
    type: string,
    suggestedViewId: ?string,
    urlViewId: ?string,
    updateView: typeof viewsActions.updateView,
    viewButtons: ?Object,
    className: ?string,
}


class ViewTable extends React.Component<Props> {
    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
    }

    componentDidMount() {
        const {
            getViewIdToDisplay, config, urlViewId, setViewActive, getView, location, fetchViewItems, activeView,
            updateView, isSearch
        } = this.props

        if (isSearch) {
            updateView(config.get('searchView')(this._searchQuery(this.props)), false)
        } else if (activeView.isEmpty() || urlViewId) {
            const suggestedViewId = getViewIdToDisplay(config.get('type'), urlViewId)

            //$FlowFixMe
            setViewActive(getView(suggestedViewId))
        }

        fetchViewItems(null, location.query.cursor)
    }

    componentWillReceiveProps(nextProps: Props) {
        const {
            getViewIdToDisplay, fetchViewItems, updateView, setViewActive, getView,
            isLoading: wasLoading, isUpdate: wasUpdate, isSearch: wasSearch,
        } = this.props
        const {config, navigation, location, isLoading, isUpdate, isSearch, isOnFirstPage} = nextProps

        const currentSuggestedViewId = getViewIdToDisplay(this.props.config.get('type'), this.props.urlViewId)
        const nextSuggestedViewId = getViewIdToDisplay(nextProps.config.get('type'), nextProps.urlViewId)

        if (nextProps.urlViewId && nextSuggestedViewId && nextSuggestedViewId.toString() !== nextProps.urlViewId) {
            return browserHistory.push('/app')
        }

        const urlCursor = location.query.cursor || null
        const storedCursor = navigation.get('current_cursor') || null
        const cursorAreDifferent = urlCursor !== storedCursor

        const justFinishedFetching = wasLoading('fetchList') && !isLoading('fetchList')

        const leavingSearchMode = wasSearch && !isSearch
        const leavingAddNewMode = !wasUpdate && isUpdate
        const suggestedViewChanged = currentSuggestedViewId !== nextSuggestedViewId
        const noActiveView = !nextProps.hasActiveView

        let shouldFetchViewItems = false

        if (!wasSearch && isSearch) {
            // entering "search" mode
            updateView(config.get('searchView')(this._searchQuery(nextProps)), false)
            shouldFetchViewItems = true
        } else if (wasUpdate && !isUpdate) {
            // entering "add new" mode
            updateView(config.get('newView')())
            shouldFetchViewItems = true
        } else if (isSearch && this._searchQuery(this.props) !== this._searchQuery(nextProps)) {
            // in "search" mode, if search query has changed, research again
            updateView(config.get('searchView')(this._searchQuery(nextProps)), false)
            shouldFetchViewItems = true
        } else if (leavingSearchMode || leavingAddNewMode || suggestedViewChanged || noActiveView) {
            //$FlowFixMe
            setViewActive(getView(nextSuggestedViewId))
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
            } else if (!isLoading('fetchList') && (urlCursor || !isOnFirstPage)) {
                // This happens when loading a page directly with a cursor in the URL.
                // It can also happen when switching between two non-first pages, but in this case we don't want to
                // trigger a fetch until the current fetch is over
                return fetchViewItems(null, urlCursor)
            }
        }

        if (shouldFetchViewItems) {
            return fetchViewItems()
        }
    }

    _searchQuery = (props: Props = this.props) => {
        return _get(props, 'location.query.q', '')
    }

    _getItemUrl = (item: Map<*,*>): string => {
        const {config} = this.props
        if (!config) {
            return ''
        }

        return `/app/${config.get('routeItem')}/${item.get('id')}`
    }

    _renderTable = () => {
        const {
            ActionsComponent, type, items, config, isSearch, activeView,
            isLoading, selectedItemsIds, fetchViewItems, navigation
        } = this.props

        const displayedFields = config.get('fields', fromJS([]))
            .filter((field) => {
                // display field if mandatory from config
                if (config.get('mainField') === field.get('name')) {
                    return true
                }

                return activeView.get('fields', fromJS([])).contains(field.get('name'))
            })

        return (
            <Table
                view={activeView}
                config={config}
                isLoading={isLoading}
                navigation={navigation}
                selectedItemsIds={selectedItemsIds}
                type={type}
                items={items}
                fields={displayedFields}
                isSearch={isSearch}
                ActionsComponent={ActionsComponent}
                onPageChange={fetchViewItems}
                getItemUrl={this._getItemUrl}
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
                <div className={css.table}>
                    {this._renderTable()}
                </div>
            </div>
        )
    }
}

export default withRouter(connect((state, ownProps) => {
    const config = viewsConfig.getConfigByName(ownProps.type)

    return {
        activeView: viewsSelectors.getActiveView(state),
        config,
        location: ownProps.location,
        getView: viewsSelectors.makeGetView(state),
        getViewIdToDisplay: viewsSelectors.makeGetViewIdToDisplay(state),
        hasActiveView: viewsSelectors.hasActiveViewOfType(config.get('type'))(state),

        isLoading: viewsSelectors.makeIsLoading(state),
        isOnFirstPage: viewsSelectors.isOnFirstPage(state),
        navigation: viewsSelectors.getNavigation(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}, {
    fetchViewItems: viewsActions.fetchViewItems,
    setViewActive: viewsActions.setViewActive,
    updateView: viewsActions.updateView,
})(ViewTable))
