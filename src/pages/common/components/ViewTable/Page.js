import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import _get from 'lodash/get'

import {Loader} from '../Loader'
import Header from './Header'
import Table from './Table'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'

import css from './Page.less'

@withRouter
@connect((state, ownProps) => {
    const config = viewsSelectors.getViewConfig(ownProps.type)
    const currentPage = ownProps.location.query.page || 1

    return {
        activeView: viewsSelectors.getActiveView(state),
        config,
        currentPage: currentPage.toString(),
        getView: viewsSelectors.makeGetView(state),
        getViewIdToDisplay: viewsSelectors.makeGetViewIdToDisplay(state),
        hasActiveView: viewsSelectors.hasActiveViewOfType(config.get('type'))(state),
    }
}, {
    fetchPage: viewsActions.fetchPage,
    setViewActive: viewsActions.setViewActive,
    updateView: viewsActions.updateView,
})
export default class Page extends React.Component {
    static propTypes = {
        // a React element not instantiated is a function
        ActionsComponent: PropTypes.func,
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        currentPage: PropTypes.string.isRequired,
        fetchPage: PropTypes.func.isRequired,
        getViewIdToDisplay: PropTypes.func.isRequired,
        getView: PropTypes.func.isRequired,
        hasActiveView: PropTypes.bool.isRequired,
        isSearch: PropTypes.bool.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        items: ImmutablePropTypes.list.isRequired,
        router: PropTypes.object.isRequired,
        setViewActive: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
        urlViewId: PropTypes.string,
        updateView: PropTypes.func.isRequired,
    }

    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
    }

    componentDidMount() {
        let shouldFetchDiscreetly = false
        const suggestedViewId = this.props.getViewIdToDisplay(this.props.config.get('type'), this.props.urlViewId)

        // if the displayed view is already the active view, just fetch items discreetly
        if (this.props.hasActiveView && this.props.activeView.get('id') === suggestedViewId) {
            shouldFetchDiscreetly = true
        }

        this.props.setViewActive(this.props.getView(suggestedViewId))
        this.props.fetchPage(this.props.currentPage, shouldFetchDiscreetly)
    }

    componentWillReceiveProps(nextProps) {
        const {getViewIdToDisplay} = this.props
        const {config} = nextProps

        const currentSuggestedViewId = getViewIdToDisplay(this.props.config.get('type'), this.props.urlViewId)
        const nextSuggestedViewId = getViewIdToDisplay(nextProps.config.get('type'), nextProps.urlViewId)

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
            this.props.setViewActive(this.props.getView(nextSuggestedViewId))
            return this.props.fetchPage(1)
        }

        // leaving "add new" mode
        if (!this.props.isUpdate && nextProps.isUpdate) {
            this.props.setViewActive(this.props.getView(nextSuggestedViewId))
            return this.props.fetchPage(1)
        }

        // suggested view to display (mostly because url changed) has changed OR there is no active view
        if (currentSuggestedViewId !== nextSuggestedViewId || !nextProps.hasActiveView) {
            this.props.setViewActive(this.props.getView(nextSuggestedViewId))
            return this.props.fetchPage(1)
        }
    }

    _searchQuery = (props = this.props) => {
        return _get(props, 'location.query.q', '')
    }

    _renderTable = () => {
        const {type, items, config, isSearch, activeView} = this.props

        const displayedFields = config.get('fields', fromJS([]))
            .filter(field => activeView.get('fields', fromJS([])).contains(field.get('name')))

        return (
            <Table
                type={type}
                items={items}
                fields={displayedFields}
                isSearch={isSearch}
            />
        )
    }

    render() {
        const {ActionsComponent, activeView, isSearch, isUpdate, type} = this.props

        if (activeView.isEmpty()) {
            return <Loader loading />
        }

        return (
            <div className={css.page}>
                <div className={css.header}>
                    <Header
                        isSearch={isSearch}
                        isUpdate={isUpdate}
                        ActionsComponent={ActionsComponent}
                        type={type}
                    />
                </div>
                <div className={css.table}>
                    {this._renderTable()}
                </div>
            </div>
        )
    }
}

