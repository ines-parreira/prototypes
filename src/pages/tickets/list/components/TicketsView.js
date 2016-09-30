import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import EditableTitle from '../../common/components/EditableTitle'
import TicketTable from './TicketTable'
import ListActions from './ListActions'
import FilterTopbar from './FilterTopbar'
import Search from '../../../common/components/Search'
import {CELL_WIDTH} from '../../../../config'
import {slugify} from './utils'

export default class TicketsView extends React.Component {
    constructor() {
        super()

        this.state = {}
    }

    getWidth = () => {
        let width = 0
        this.props.views
            .getIn(['active', 'fields'], fromJS([]))
            .forEach((field) => {
                if (field.get('visible')) {
                    width += field.get('width') || CELL_WIDTH
                }
            })
        return width + CELL_WIDTH  // One extra cell for the row checkbox
    }

    updateView = (view, edit) => this.props.actions.view.updateView(view, edit)

    resetView = () => this.props.actions.view.resetView()

    deleteView = (view) => this.props.actions.view.deleteView(view)

    updateViewName = (name) => {
        this.updateView(this.props.views.get('active').merge({
            name,
            slug: slugify(name)
        }))
    }

    updateField = (field) => this.props.actions.view.updateField(field)

    addFieldFilter = (field, filter) => this.props.actions.view.addFieldFilter(field, filter)

    updateFieldEnumSearch = (field, query) => this.props.actions.view.updateFieldEnumSearch(field, query)

    viewActionEdit = () => {
        // updateView enters editMode by default
        this.props.actions.view.updateView(this.props.views.get('active'))
    }

    viewActionDelete = () => {
        this.deleteView(this.props.views.get('active'))
    }

    componentDidUpdate() {
        // view was edited,
        // update the header dimensions.
        this.setFixedHeader(this.refs.header)
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

        this.state.headerHeight = $header.offsetHeight
    }

    render() {
        const {views, tickets, currentUser, search, schemas, actions, fetchPage} = this.props

        const view = views.get('active')

        if (!view.get('fields')) {
            return null
        }

        // for performance, cache the value in state.
        if (!this.state.scrollbarWidth) {
            this.state.scrollbarWidth = this.getScrollbarWidth()
        }

        return (
            <div className="tickets-view">
                <div className="tickets-view-header-container" ref="header" style={{
                    width: `calc(100% - ${this.state.scrollbarWidth}px)`
                }}>
                    <div className="tickets-view-header" style={{
                        maxWidth: this.getWidth()
                    }}>
                        <div className="sticky-header">

                            <div className="ui text menu sticky-header-search">
                                <div className="left menu item">

                                    <div
                                        className="ui dropdown tickets-view-settings"
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
                                                className="item tickets-view-settings-delete"
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
                                        onChange={search}
                                        className="long"
                                        forcedQuery={view.getIn(['search', 'query'])}
                                        queryPath="bool.should.0.multi_match.query,bool.should.1.multi_match.query,bool.should.2.nested.query.multi_match.query"
                                        query={{
                                            bool: {
                                                should: [
                                                    {
                                                        multi_match: {
                                                            query: '',
                                                            operator: 'and',
                                                            fields: [
                                                                'subject^3',
                                                                'requester.name',
                                                                'sender.name',
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        multi_match: {
                                                            query: '',
                                                            type: 'phrase_prefix',
                                                            fields: [
                                                                'requester.email',
                                                                'sender.email'
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        nested: {
                                                            path: 'messages',
                                                            query: {
                                                                multi_match: {
                                                                    query: '',
                                                                    type: 'phrase_prefix',
                                                                    fields: [
                                                                        'messages.source.from.name',
                                                                        'messages.source.from.email',
                                                                        'messages.source.to.name',
                                                                        'messages.source.to.email',
                                                                        'messages.body_*'
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }}
                                        placeholder="Search tickets"
                                        searchDebounceTime={400}
                                        location={view.get('id')}
                                    />
                                </div>
                            </div>

                            <div className="ui grid view-header">
                                <div className="six wide column">
                                    <EditableTitle
                                        title={view.get('name') || ''}
                                        placeholder="View name"
                                        update={this.updateViewName}
                                    />
                                </div>
                                <div className="ten wide column">
                                    <ListActions
                                        views={views}
                                        shouldDisplayBulkActions={
                                            tickets.getIn(['_internal', 'selectedItemsIds'], fromJS([])).size > 0
                                        }
                                        actions={actions}
                                        selectedItemsIds={tickets.getIn(['_internal', 'selectedItemsIds'], fromJS([]))}
                                        currentUser={currentUser}
                                        tags={this.props.tags}
                                        agents={this.props.users.get('agents', fromJS([]))}
                                    />
                                </div>
                            </div>

                        </div>
                        <FilterTopbar
                            views={views}
                            schemas={schemas}
                            resetView={this.resetView}
                            removeFieldFilter={actions.view.removeFieldFilter}
                            updateFieldFilterOperator={actions.view.updateFieldFilterOperator}
                            submitView={actions.view.submitView}
                            currentUser={currentUser}
                            agents={this.props.users.get('agents', fromJS([]))}
                            tags={this.props.tags}
                            updateFieldFilter={actions.view.updateFieldFilter}
                        />
                    </div>
                </div>

                <TicketTable
                    view={view}
                    tickets={tickets}
                    schemas={schemas}
                    currentUser={currentUser}

                    resetView={this.resetView}
                    updateView={this.updateView}
                    updateField={this.updateField}
                    addFieldFilter={this.addFieldFilter}
                    updateFieldEnumSearch={this.updateFieldEnumSearch}
                    fetchPage={fetchPage}

                    saveIndex={this.props.actions.tickets.saveIndex}

                    toggleTicketSelection={actions.tickets.toggleTicketSelection}
                    getWidth={this.getWidth}

                    style={{
                        paddingTop: this.state.headerHeight
                    }}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    tickets: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,

    fetchPage: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired
}
