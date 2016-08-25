import React, {PropTypes} from 'react'
import EditableTitle from '../../common/components/EditableTitle'
import TicketTable from './TicketTable'
import ListActions from './ListActions'
import FilterTopbar from './FilterTopbar'
import Search from '../../../common/components/Search'
import {CELL_WIDTH} from '../../../../config'

export default class TicketsView extends React.Component {
    getWidth = () => {
        let width = 0
        this.props.views.get('active').get('fields').forEach((field) => {
            if (field.get('visible')) {
                width += field.get('width') ? field.get('width') : CELL_WIDTH
            }
        })
        return width + CELL_WIDTH  // One extra cell for the row checkbox
    }

    updateView = (view) => this.props.actions.view.updateView(view)

    resetView = () => this.props.actions.view.resetView()

    deleteView = (view) => this.props.actions.view.deleteView(view)

    updateViewName = (name) => {
        this.updateView(this.props.views.get('active').merge({
            name,
            slug: name.toLowerCase().trim().replace(/[ ]/g, '-')
        }))
    }

    updateField = (field) => this.props.actions.view.updateField(field)

    addFieldFilter = (field, filter) => this.props.actions.view.addFieldFilter(field, filter)

    updateFieldEnumSearch = (field, query) => this.props.actions.view.updateFieldEnumSearch(field, query)

    render() {
        const {views, tickets, currentUser, search, schemas, actions, fetchPage} = this.props
        const view = views.get('active')

        if (!view.get('fields')) {
            return null
        }

        return (
            <div className="tickets-view">
                <div className="tickets-view-header-container">
                    <div className="tickets-view-header" style={{maxWidth: this.getWidth()}}>
                        <div className="sticky-header">

                            <div className="ui text menu sticky-header-search">
                                <div className="left menu item"></div>
                                <div className="right menu item">
                                    <Search
                                        autofocus
                                        onChange={search}
                                        className="long"
                                        forcedQuery={view.getIn(['search', 'query'])}
                                        queryPath="bool.should.0.multi_match.query,bool.should.1.nested.query.multi_match.query"
                                        query={{
                                            bool: {
                                                should: [
                                                    {
                                                        multi_match: {
                                                            query: '',
                                                            type: 'phrase_prefix',
                                                            fields: [
                                                                'subject^3',
                                                                'requester.name',
                                                                'requester.email',
                                                                'sender.name',
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
                                                                    fields: [
                                                                        'messages.sender.name',
                                                                        'messages.sender.email',
                                                                        'messages.receiver.name',
                                                                        'messages.receiver.email',
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
                                        shouldDisplayBulkActions={tickets.get('selected').size > 0}
                                        actions={actions}
                                        selected={tickets.get('selected')}
                                        currentUser={currentUser}
                                        tags={this.props.tags}
                                        agents={this.props.users.get('agents')}
                                    />

                                </div>
                            </div>

                        </div>
                        <FilterTopbar
                            views={views}
                            schemas={schemas}
                            resetView={this.resetView}
                            deleteView={this.deleteView}
                            removeFieldFilter={actions.view.removeFieldFilter}
                            updateFieldFilterOperator={actions.view.updateFieldFilterOperator}
                            submitView={actions.view.submitView}
                            width={this.getWidth()}
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
