import React, {PropTypes} from 'react'
import EditableTitle from './../EditableTitle'
import TicketTable from './TicketTable'
import ListActions from './ListActions'
import FilterTopbar from './FilterTopbar'
import Search from '../../Search'
import {CELL_WIDTH} from '../../../constants'

export default class TicketsView extends React.Component {
    getWidth = () => {
        let width = 0
        this.props.views.get('active').get('fields').map((field) => {
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

        const style = {maxWidth: this.getWidth(), width: this.getWidth()}

        return (
            <div className="TicketsView" style={style}>
                <div style={style}>
                    <div className="sticky-header">

                        <div className="ui text menu">
                            <div className="left menu item"></div>
                            <div className="right menu item">
                                <Search
                                    autofocus
                                    onChange={search}
                                    className="long"
                                    queryPath="multi_match.query"
                                    query={{
                                        multi_match: {
                                            query: '',
                                            fuzziness: 3,
                                            type: 'phrase_prefix',
                                            fields: [
                                                'subject^3',
                                                'requester.name',
                                                'requester.email',
                                                'sender.name',
                                                'sender.email',
                                                'messages.sender.name',
                                                'messages.sender.email',
                                                'messages.receiver.name',
                                                'messages.receiver.email',
                                                'messages.body_*'
                                            ]
                                        }
                                    }}
                                    placeholder="Search tickets"
                                    searchDebounceTime={400}
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
                        submitView={actions.view.submitView}
                        width={this.getWidth()}
                    />
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

                    toggleTicketSelection={actions.tickets.toggleTicketSelection}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    actions: PropTypes.object.isRequired,
    tickets: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    fetchPage: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired
}
