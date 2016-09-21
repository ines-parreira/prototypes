import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Link} from 'react-router'
import * as WidgetActions from '../../../state/widgets/actions'
import Infobar from './components/infobar/Infobar'
import TicketInfobar from './components/infobar/TicketInfobar'
import {fromJS} from 'immutable'
import {Loader} from '../../common/components/Loader'

import * as InfobarActions from '../../../state/infobar/actions'
import InfobarSearchResultsList from '../../common/components/InfobarSearchResultsList'
import Search from './../../common/components/Search'

class TicketsInfobarContainer extends React.Component {
    componentWillMount() {
        const fetch = this.props.actions.widgets.fetchWidgets({
            ticket: this.props.ticket,
            type: 'ticket'
        })

        // if editing, start in edition mode when widgets have been fetched
        if (this.props.route.isEditingWidgets) {
            // start edition mode
            fetch.then(this.props.actions.startEdition)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.ticket.get('id') !== nextProps.ticket.get('id')) {
            this.props.actions.infobar.resetSearch()
        }
    }

    componentWillUnmount() {
        this.props.actions.infobar.resetSearch()
    }

    _search = (query, params, stringQuery) => {
        /** populate infobar state from search results **/
        if (stringQuery) {
            this.props.actions.infobar.search(query, 'user', ['id', 'name', 'email', 'channels'])
        } else {
            this.props.actions.infobar.resetSearch()
        }
    }

    render() {
        let sources = fromJS({
            ticket: this.props.ticket
        })

        const isEditing = this.props.route.isEditingWidgets

        // for now we want to display the bar all the time, even if empty
        // const shouldDisplayBar = source && !source.isEmpty() && !widgets.isEmpty()
        //
        // if (!shouldDisplayBar) {
        //     return null
        // }

        let content = <div className="ui active loader"/>

        if (this.props.ticket.get('requester') && this.props.infobar.getIn(['_internal', 'mode']) === 'default') {
            content = (
                !this.props.widgets.getIn(['_internal', 'hasFetchedWidgets']) ? (
                    <Loader />
                ) : (
                    <TicketInfobar
                        sources={sources}
                        isEditing={isEditing}
                        ticket={this.props.ticket}
                        widgets={this.props.widgets}
                        actions={this.props.actions.widgets}
                    />
                )
            )
        }

        if (
            this.props.infobar.getIn(['_internal', 'mode']) === 'search' &&
            !this.props.infobar.getIn(['_internal', 'loading', 'search'])
        ) {
            content = (
                <InfobarSearchResultsList
                    searchResults={this.props.infobar.get('searchResults')}
                    fetchPreviewUser={this.props.actions.infobar.fetchPreviewUser}
                />
            )
        } else if (
            this.props.infobar.getIn(['_internal', 'mode']) === 'preview' &&
            !this.props.infobar.getIn(['_internal', 'loading', 'displayedUser'])
        ) {
            sources = fromJS({
                ticket: this.props.ticket.set('requester', this.props.infobar.get('displayedUser'))
            })

            content = (
                <div>
                    <div className="preview-buttons-wrapper">
                        <div
                            className="ui button left-button"
                            onClick={() => this.props.actions.infobar.setInfobarMode('search')}
                        >
                            <i className="ui arrow left icon"/>
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
                        ticket={this.props.ticket.set('requester', this.props.infobar.get('displayedUser'))}
                        widgets={this.props.widgets}
                        actions={this.props.actions.widgets}
                    />
                </div>
            )
        } else if (!this.props.ticket.get('id')) {
            content = null
        }

        let forcedQuery = null

        if (
            !this.props.ticket.getIn(['requester', 'customer']) &&
            this.props.ticket.getIn(['requester', 'name']) &&
            this.props.infobar.getIn(['_internal', 'mode']) === 'default'
        ) {
            forcedQuery = this.props.ticket.getIn(['requester', 'name'])
        }

        return (
            <Infobar actions={this.props.actions.infobar}>
                <div className="infobar-content">
                    <div className="infobar-search-wrapper">
                        <Search
                            placeholder="Search users..."
                            bindKey
                            onChange={this._search}
                            forcedQuery={forcedQuery}
                            location={this.props.ticket.get('id')}
                            queryPath="bool.should.0.multi_match.query"
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
                    </div>
                    <div className="infobar-box">
                        {
                            // hiding edit button for now
                            false && !isEditing && (
                                <Link
                                    className="ui green button"
                                    onClick={this.props.actions.startEdition}
                                    to={`/app/ticket/${this.props.params.ticketId}/edit-widgets`}
                                >
                                    Edit
                                </Link>
                            )
                        }
                        {
                            isEditing && (
                                <div className="ui message">
                                    <p>
                                        Currently editing
                                    </p>
                                    <Link
                                        className="ui red button"
                                        onClick={this.props.actions.stopEdition}
                                        to={`/app/ticket/${this.props.params.ticketId}`}
                                    >
                                        Stop edition
                                    </Link>
                                    <button
                                        className="ui green button"
                                    >
                                        Save
                                    </button>
                                </div>
                            )
                        }
                        {content}
                    </div>
                </div>
            </Infobar>
        )
    }
}

TicketsInfobarContainer.propTypes = {
    params: PropTypes.object,
    widgets: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    infobar: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        widgets: state.widgets,
        ticket: state.ticket,
        infobar: state.infobar,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            widgets: bindActionCreators(WidgetActions, dispatch),
            infobar: bindActionCreators(InfobarActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsInfobarContainer)
