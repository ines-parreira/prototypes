import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as ViewsActions from '../../../../state/views/actions'

import EditableTitle from '../EditableTitle'
import ComplexTable from './ComplexTable'
import FilterTopbar from './FilterTopbar'
import Search from '../Search'
import {VIEW_TYPE_CONFIGURATION} from '../../../../config'
import {slugify} from '../../../../utils'
import _pick from 'lodash/pick'

class ComplexTableWrapper extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentWillMount() {
        this._updateList()
    }

    componentDidMount() {
        this.setFixedHeader(this.refs.header)
    }

    componentWillReceiveProps = (nextProps) => {
        this._updateList(nextProps)

        // for performance, cache the value in state
        if (!this.state.scrollbarWidth) {
            this.setState({
                scrollbarWidth: this.getScrollbarWidth()
            })
        }
    }

    componentDidUpdate(prevProps) {
        // view was edited,
        // update the header dimensions.
        const shouldCalculateHeaderHeight = !this.props.views.get('active', fromJS({})).equals(prevProps.views.get('active', fromJS({})))
            || !this.props.views.getIn(['_internal', 'selectedItemsIds'], fromJS([])).equals(prevProps.views.getIn(['_internal', 'selectedItemsIds'], fromJS([])))

        if (shouldCalculateHeaderHeight) {
            this.setFixedHeader(this.refs.header)
        }
    }

    _updateList = (nextProps = this.props) => {
        const currentViews = this.props.views
        const nextViews = nextProps.views
        const currentActive = currentViews.get('active', fromJS({}))
        const nextActive = nextViews.get('active', fromJS({}))

        // the asked view id (the one in the url)
        let askedViewId = nextProps.askedViewId
        const hasAskedViewId = !!askedViewId

        if (hasAskedViewId) {
            // transform the string id into integer id for future comparisons
            askedViewId = parseInt(askedViewId)
        }

        // get available views filtered by the accepted views type
        const availableViews = nextViews
            .get('items', fromJS([]))
            .filter((view) => {
                return view.get('type') === nextProps.viewsType
            })
        const firstAvailableView = availableViews.first()

        // set the first available view as active if...
        // ...there is no asked id (no id in the url)
        const shouldSetFirstAvailableViewAsActive = !hasAskedViewId
            // ...and there first available view is not empty
            && !firstAvailableView.isEmpty()
            // ...and the current view is not available
            && !availableViews.find((view) => view.get('id') === currentActive.get('id'))

        if (shouldSetFirstAvailableViewAsActive) {
            this.props.actions.views.setViewActive(firstAvailableView)
        }

        // if an id is asked and that the incoming active view is not the asked one
        if (hasAskedViewId && askedViewId !== nextActive.get('id')) {
            // get the available view that is asked
            const nextParamView = availableViews
                .find((view) => {
                    return view.get('id') === askedViewId
                }, null, fromJS({}))

            // is there is one, set it
            if (!nextParamView.isEmpty()) {
                this.props.actions.views.setViewActive(nextParamView)
            }
        }

        // get current and next pages
        const currentPage = this.props.views.getIn(['_internal', 'pagination', 'page'], 1)
        let nextPage = nextProps.views.getIn(['_internal', 'pagination', 'page'], 1)

        // check if the view id edited (dirty)
        const viewHasChanged = !currentActive.delete('fields').equals(nextActive.delete('fields'))

        // should go to first page if view is edited or if view id changed (switched to new view)
        const shouldGoToFirstPage = currentActive.get('id') !== nextActive.get('id') || viewHasChanged

        // set active page to first page
        if (shouldGoToFirstPage) {
            this._setPage(1, nextProps)
            nextPage = 1
        }

        // refetch tickets if page has changed or if the user is sent to first page
        const shouldFetchTickets = shouldGoToFirstPage || currentPage !== nextPage

        if (shouldFetchTickets) {
            nextProps.actions.views.fetchPage(nextPage)
            amplitude.getInstance().logEvent('Opened view', _pick(nextActive.toJS(), ['id', 'slug']))
        }
    }

    _setPage = (page = 1) => {
        this.props.actions.views.setPage(page)
    }

    _search = (query, params, stringQuery) => {
        const activeView = this.props.views.get('active')

        if (stringQuery) {
            this.props.actions.views.updateView(activeView.merge({search: {query, params}}))
        } else if (activeView.get('search')) {
            this.props.actions.views.updateView(activeView.set('search', null))
        }
    }

    updateView = (view, edit) => this.props.actions.views.updateView(view, edit)

    resetView = () => this.props.actions.views.resetView()

    deleteView = (view) => this.props.actions.views.deleteView(view)

    updateViewName = (name) => {
        this.updateView(this.props.views.get('active').merge({
            name,
            slug: slugify(name)
        }))
    }

    addFieldFilter = (field, filter) => this.props.actions.views.addFieldFilter(field, filter)

    updateFieldEnumSearch = (field, query) => this.props.actions.views.updateFieldEnumSearch(field, query)

    viewActionEdit = () => {
        // updateView enters editMode by default
        this.props.actions.views.updateView(this.props.views.get('active'))
    }

    viewActionDelete = () => {
        this.deleteView(this.props.views.get('active'))
    }

    getScrollbarWidth() {
        const $node = document.createElement('div')
        // default scrollbar width
        let scrollbarWidth = 20

        $node.setAttribute('style', `
            position: absolute;
            left: -50px;
            top: -50px;
            visibility: hidden;
            width: 50px;
            overflow: scroll;
        `)

        document.body.appendChild($node)
        scrollbarWidth = $node.offsetWidth - $node.clientWidth
        document.body.removeChild($node)

        return scrollbarWidth
    }

    setFixedHeader($header) {
        // get header height.
        // it changes when editing the view.
        if (!$header) {
            return
        }

        this.setState({
            headerHeight: $header.offsetHeight
        })
    }

    render() {
        const {
            views,
            items,
            searchQuery,
            queryPath,
            viewsType,
            fields,
            schemas,
            actions,
            ActionsComponent,
            hasBulkActions,
            currentUser,
            agents,
        } = this.props

        if (fields.isEmpty()) {
            return null
        }

        const activeView = views.get('active')
        const viewConfig = VIEW_TYPE_CONFIGURATION[viewsType]

        if (activeView.get('type') !== viewsType) {
            return null
        }

        return (
            <div className="complex-list">
                <div
                    className="complex-list-header-container"
                    ref="header"
                    style={{
                        width: `calc(100% - ${this.state.scrollbarWidth}px)`
                    }}
                >
                    <div className="complex-list-header complex-list-limited">
                        <div className="sticky-header">
                            <div className="ui text menu sticky-header-search">
                                <div className="left menu item">

                                    <div
                                        className="ui dropdown complex-list-settings"
                                        ref={(dropdown) => {
                                            $(dropdown).dropdown({
                                                action: () => {
                                                    // HACK action='hide' does not work
                                                    // as described in the docs.
                                                    $(dropdown).dropdown('hide')
                                                }
                                            })
                                        }}
                                    >
                                        <i className="setting icon" />
                                        <div className="text">VIEW SETTINGS</div>
                                        <div className="menu">
                                            <div
                                                className="item"
                                                onClick={this.viewActionEdit}
                                            >
                                                Edit view
                                            </div>
                                            <div className="divider"></div>
                                            <div
                                                className="item red text"
                                                onClick={this.viewActionDelete}
                                            >
                                                Delete view
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="right menu item">
                                    <Search
                                        autofocus
                                        bindKey
                                        onChange={this._search}
                                        className="long"
                                        forcedQuery={activeView.getIn(['search', 'query'])}
                                        queryPath={queryPath}
                                        query={searchQuery}
                                        placeholder={`Search ${viewConfig.plural}`}
                                        searchDebounceTime={400}
                                        location={activeView.get('id')}
                                    />
                                </div>
                            </div>

                            <div className="ui sixteen wide column flex-spaced-row no-wrap view-header">
                                <EditableTitle
                                    title={activeView.get('name') || ''}
                                    placeholder="View name"
                                    update={this.updateViewName}
                                />
                                {
                                    ActionsComponent
                                    && (
                                        <ActionsComponent
                                            view={activeView}
                                            selectedItemsIds={views.getIn(['_internal', 'selectedItemsIds'], fromJS([]))}
                                        />
                                    )
                                }
                            </div>

                        </div>
                        <FilterTopbar
                            views={views}
                            schemas={schemas}
                            resetView={this.resetView}
                            removeFieldFilter={actions.views.removeFieldFilter}
                            updateFieldFilterOperator={actions.views.updateFieldFilterOperator}
                            submitView={actions.views.submitView}
                            currentUser={currentUser}
                            agents={agents}
                            tags={this.props.tags}
                            updateFieldFilter={actions.views.updateFieldFilter}
                        />
                    </div>
                </div>

                <ComplexTable
                    views={views}
                    view={activeView}
                    viewConfig={viewConfig}
                    items={items}
                    fields={fields}
                    schemas={schemas}
                    currentUser={currentUser}
                    hasBulkActions={hasBulkActions}

                    resetView={this.resetView}
                    updateView={this.updateView}
                    addFieldFilter={this.addFieldFilter}
                    updateFieldEnumSearch={this.updateFieldEnumSearch}
                    setPage={this._setPage}

                    saveIndex={this.props.actions.views.saveIndex}

                    toggleSelection={actions.views.toggleSelection}

                    style={{
                        paddingTop: this.state.headerHeight
                    }}
                />
            </div>
        )
    }
}

ComplexTableWrapper.propTypes = {
    items: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    actions: PropTypes.shape({
        views: PropTypes.object.isRequired,
    }).isRequired,

    searchQuery: PropTypes.object.isRequired,
    queryPath: PropTypes.string.isRequired,
    viewsType: PropTypes.string.isRequired,
    askedViewId: PropTypes.string,

    // a React element not instantiated is a function
    ActionsComponent: PropTypes.func,
    hasBulkActions: PropTypes.bool.isRequired,
}

ComplexTableWrapper.defaultProps = {
    users: fromJS({}),
    searchQuery: {},
    queryPath: '',
    viewsType: 'ticket-list',
    hasBulkActions: false
}

function mapStateToProps(state) {
    return {
        views: state.views,
        schemas: state.schemas,
        users: state.users,
        currentUser: state.currentUser,
        tags: state.tags.get('items', fromJS([])),
        agents: state.users.get('agents', fromJS([])),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(ViewsActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComplexTableWrapper)

