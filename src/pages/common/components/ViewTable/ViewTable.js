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
    currentPage: number,
    fetchPage: typeof viewsActions.fetchPage,
    getViewIdToDisplay: typeof viewsSelectors.getViewIdToDisplay,
    getView: typeof viewsSelectors.getView,
    hasActiveView: boolean,

    isLoading: (string) => boolean,
    pagination: Map<*,*>,
    selectedItemsIds: List<*>,

    isSearch: boolean,
    isUpdate: boolean,
    items: List<*>,
    setViewActive: typeof viewsActions.setViewActive,
    type: string,
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
        const suggestedViewId = this.props.getViewIdToDisplay(this.props.config.get('type'), this.props.urlViewId)

        //$FlowFixMe
        this.props.setViewActive(this.props.getView(suggestedViewId))
        this.props.fetchPage(this.props.currentPage)
    }

    componentWillReceiveProps(nextProps) {
        const {getViewIdToDisplay} = this.props
        const {config} = nextProps

        const currentSuggestedViewId = getViewIdToDisplay(this.props.config.get('type'), this.props.urlViewId)
        const nextSuggestedViewId = getViewIdToDisplay(nextProps.config.get('type'), nextProps.urlViewId)

        if (nextProps.urlViewId && nextSuggestedViewId && nextSuggestedViewId.toString() !== nextProps.urlViewId) {
            return browserHistory.push('/app')
        }

        // if on the same view but page changed, fetch the new page
        if (currentSuggestedViewId === nextSuggestedViewId && this.props.currentPage !== nextProps.currentPage) {
            return this.props.fetchPage(nextProps.currentPage)
        }

        // entering search mode
        if (!this.props.isSearch && nextProps.isSearch) {
            this.props.updateView(config.get('searchView')(this._searchQuery(nextProps)), false)
            return this.props.fetchPage(nextProps.currentPage)
        }

        // entering "add new" mode
        if (this.props.isUpdate && !nextProps.isUpdate) {
            this.props.updateView(config.get('newView')())
            return this.props.fetchPage(1)
        }

        // in search mode, if search has changed, research again
        if (nextProps.isSearch && this._searchQuery(this.props) !== this._searchQuery(nextProps)) {
            this.props.updateView(config.get('searchView')(this._searchQuery(nextProps)), false)
            return this.props.fetchPage(1)
        }

        // leaving search mode
        if (this.props.isSearch && !nextProps.isSearch) {
            //$FlowFixMe
            this.props.setViewActive(this.props.getView(nextSuggestedViewId))
            return this.props.fetchPage(1)
        }

        // leaving "add new" mode
        if (!this.props.isUpdate && nextProps.isUpdate) {
            //$FlowFixMe
            this.props.setViewActive(this.props.getView(nextSuggestedViewId))
            return this.props.fetchPage(1)
        }

        // suggested view to display (mostly because url changed) has changed OR there is no active view
        if (currentSuggestedViewId !== nextSuggestedViewId || !nextProps.hasActiveView) {
            //$FlowFixMe
            this.props.setViewActive(this.props.getView(nextSuggestedViewId))
            return this.props.fetchPage(1)
        }
    }

    _searchQuery = (props = this.props) => {
        return _get(props, 'location.query.q', '')
    }

    _pageChange = (page: number) => {
        // update page query param of current location (add/update "page" param)
        const location = Object.assign({}, browserHistory.getCurrentLocation())
        Object.assign(location.query, {page})
        browserHistory.push(location)
    }

    _getItemUrl = (item: Map<*,*>): string | void => {
        const {config} = this.props
        if (!config) {
            return
        }

        return `/app/${config.get('routeItem')}/${item.get('id')}`
    }

    _renderTable = () => {
        const {
            ActionsComponent, type, items, config, isSearch, activeView,
            isLoading, pagination, selectedItemsIds
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
                pagination={pagination}
                selectedItemsIds={selectedItemsIds}
                type={type}
                items={items}
                fields={displayedFields}
                isSearch={isSearch}
                ActionsComponent={ActionsComponent}
                onPageChange={this._pageChange}
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
    const currentPage = parseInt(ownProps.location.query.page) || 1

    return {
        activeView: viewsSelectors.getActiveView(state),
        config,
        currentPage,
        getView: viewsSelectors.makeGetView(state),
        getViewIdToDisplay: viewsSelectors.makeGetViewIdToDisplay(state),
        hasActiveView: viewsSelectors.hasActiveViewOfType(config.get('type'))(state),

        isLoading: viewsSelectors.makeIsLoading(state),
        pagination: viewsSelectors.getPagination(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}, {
    fetchPage: viewsActions.fetchPage,
    setViewActive: viewsActions.setViewActive,
    updateView: viewsActions.updateView,
})(ViewTable))
