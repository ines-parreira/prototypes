import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {browserHistory} from 'react-router'
import classnames from 'classnames'
import * as WidgetActions from '../../../state/widgets/actions'
import Infobar from './components/infobar/Infobar'
import TicketInfobar from './components/infobar/TicketInfobar'
import {fromJS} from 'immutable'
import {Loader} from '../../common/components/Loader'
import {isTicketDifferent} from './../common/utils'
import {areSourcesReady} from './components/infobar/utils'

import * as InfobarActions from '../../../state/infobar/actions'
import InfobarSearchResultsList from '../../common/components/InfobarSearchResultsList'
import Search from './../../common/components/Search'

class TicketsInfobarContainer extends React.Component {
    constructor(props) {
        super(props)

        this.ticketWidgetsTemplate = fromJS([])
    }

    componentWillMount() {
        const {actions} = this.props

        actions.widgets.selectContext('ticket')
        actions.widgets.fetchWidgets()
    }

    shouldComponentUpdate(nextProps) {
        return isTicketDifferent(this.props.ticket, nextProps.ticket) ||
            !this.props.widgets.equals(nextProps.widgets) ||
            !this.props.infobar.equals(nextProps.infobar)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.ticket.get('id') !== nextProps.ticket.get('id')) {
            nextProps.actions.infobar.resetSearch()
        }

        const isEditingParam = !!nextProps.route.isEditingWidgets
        const isEditing = nextProps.widgets.getIn(['_internal', 'isEditing'])

        if (isEditingParam !== isEditing) {
            this._toggleEditionMode(isEditingParam)
        }
    }

    componentWillUnmount() {
        this.props.actions.infobar.resetSearch()
    }

    /**
     * Populate infobar state from search results
     */
    _search = (query, params, stringQuery) => {
        if (stringQuery) {
            this.props.actions.infobar.search(query, 'user', ['id', 'name', 'email', 'channels'])
        } else {
            this.props.actions.infobar.resetSearch()
        }
    }

    /**
     * Save edited widgets to database
     */
    _saveWidgets = () => {
        const {actions, widgets} = this.props

        const editedItems = widgets.getIn(['_internal', 'editedItems'], fromJS([])).toJS()

        actions.widgets.submitWidgets(editedItems)
    }

    /**
     * Cancel widgets edition modifications
     */
    _cancelWidgetsUpdates = () => {
        const {actions} = this.props
        actions.widgets.startEditionMode('ticket')
    }

    /**
     * Set the edition mode to passed one
     */
    _toggleEditionMode = (isEditing) => {
        const {actions, params} = this.props

        if (isEditing) {
            actions.widgets.startEditionMode('ticket')
            browserHistory.push(`/app/ticket/${params.ticketId}/edit-widgets`)
        } else {
            actions.widgets.stopEditionMode()
            browserHistory.push(`/app/ticket/${params.ticketId}`)
        }
    }

    /**
     * Render edition options such as save or cancel
     */
    _renderWidgetsEditionTools = () => {
        const {widgets} = this.props

        const isDirty = widgets.getIn(['_internal', 'isDirty'])
        const isSavingWidgets = widgets.getIn(['_internal', 'loading', 'saving'])

        return (
            <div className="infobar-footer">
                <div>
                    <button
                        className={classnames('ui green small button', {
                            loading: isSavingWidgets
                        })}
                        disabled={isSavingWidgets || !isDirty}
                        onClick={this._saveWidgets}
                    >
                        Save changes
                    </button>
                    <button
                        className="ui small button"
                        disabled={isSavingWidgets || !isDirty}
                        onClick={this._cancelWidgetsUpdates}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    render() {
        const {
            actions,
            ticket,
            widgets,
            route,
            infobar,
            params
        } = this.props

        let sources = fromJS({
            ticket
        })

        let content = <Loader />

        const mode = infobar.getIn(['_internal', 'mode'], 'default')

        const isLoading = infobar
            .getIn(['_internal', 'loading'], fromJS({}))
            .some(loading => loading)

        const isEditing = widgets.getIn(['_internal', 'isEditing'])
        const hasFetchedWidgets = widgets.getIn(['_internal', 'hasFetchedWidgets'])

        // if there is no complete user to display, search the user name
        const customer = ticket.getIn(['requester', 'customer'], fromJS({}))
        const hasCustomer = customer && !customer.isEmpty()
        const shouldForceSearch = !hasCustomer
            && ticket.getIn(['requester', 'name'])
            && mode === 'default'
        const forcedQuery = shouldForceSearch ? ticket.getIn(['requester', 'name']) : null

        const canEditWidgets = !isLoading
            && hasFetchedWidgets
            && areSourcesReady(sources)
            && mode === 'default'
            && !forcedQuery

        if (isLoading) {
            // loading
            content = <Loader />
        } else if (mode === 'default' && !forcedQuery) {
            // current ticket user info
            content = (
                !hasFetchedWidgets ? (
                    <Loader />
                ) : (
                    <TicketInfobar
                        sources={sources}
                        isEditing={isEditing}
                        ticket={ticket}
                        widgets={widgets}
                        actions={actions.widgets}
                        route={route}
                        params={params}
                    />
                )
            )
        } else if (mode === 'search') {
            // list of found users
            content = (
                <InfobarSearchResultsList
                    searchResults={infobar.get('searchResults')}
                    fetchPreviewUser={actions.infobar.fetchPreviewUser}
                />
            )
        } else if (mode === 'preview') {
            // selected user info
            const tweakedTicket = ticket.set('requester', infobar.get('displayedUser'))

            sources = fromJS({
                ticket: tweakedTicket
            })

            content = (
                <div>
                    <div className="preview-buttons-wrapper">
                        <div
                            className="ui button left-button"
                            onClick={() => actions.infobar.setInfobarMode('search')}
                        >
                            <i className="ui arrow left icon" />
                            BACK
                        </div>

                        {/*
                         <div
                         className="ui button right-button disabled"
                         style={{float: 'right'}}
                         >
                         MERGE
                         </div>
                         */}
                    </div>
                    <TicketInfobar
                        sources={sources}
                        isEditing={isEditing}
                        ticket={tweakedTicket}
                        widgets={widgets}
                        actions={actions.widgets}
                        route={route}
                        params={params}
                    />
                </div>
            )
        } else if (!ticket.get('id')) {
            // if new ticket
            content = null
        }

        return (
            <Infobar>
                <div className="infobar-content">
                    <div className="infobar-search-wrapper">
                        <Search
                            placeholder="Search users..."
                            bindKey
                            onChange={this._search}
                            forcedQuery={forcedQuery}
                            location={ticket.get('id')}
                            queryPath="bool.should.0.multi_match.query"
                            disabled={isEditing}
                            query={{
                                bool: {
                                    should: [
                                        {
                                            multi_match: {
                                                query: '',
                                                type: 'phrase_prefix',
                                                fields: ['name', 'email']
                                            }
                                        }
                                    ]
                                }
                            }}
                        />

                        <button
                            className={classnames('ui icon button icon-edit-mode', {
                                active: isEditing,
                                disabled: !canEditWidgets
                            })}
                            onClick={() => {
                                if (canEditWidgets) {
                                    this._toggleEditionMode(!isEditing)
                                }
                            }}
                            title="Manage widgets"
                        >
                            <i className="setting icon" />
                        </button>
                    </div>
                    <div className="infobar-box">
                        {content}
                    </div>
                </div>
                {
                    isEditing && this._renderWidgetsEditionTools()
                }
            </Infobar>
        )
    }
}

TicketsInfobarContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    infobar: PropTypes.object.isRequired,
    params: PropTypes.object,
    route: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        infobar: state.infobar,
        ticket: state.ticket,
        widgets: state.widgets
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            infobar: bindActionCreators(InfobarActions, dispatch),
            widgets: bindActionCreators(WidgetActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsInfobarContainer)
