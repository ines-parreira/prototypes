import React, {PropTypes} from 'react'
import TicketTable from './TicketTable'
import ShowMoreFieldsDropdown from './ShowMoreFieldsDropdown'
import Search from '../Search'
import FilterDropdown from './FilterDropdown'
import { TICKET_TAGS, TICKET_ASSIGNEE, TICKET_STATUS, TICKET_STATUSES } from '../../constants'


export default class TicketsView extends React.Component {
    updateSimpleRules = (data) => {
        this.props.actions.view.updateSimpleRules(this.props.view.slug, data)
        // Fetch tickets with the updated filters_ast as a "pre-view"
        this.props.actions.ticket.fetchPage(this.props.view, 1, {
            with_filters_ast: JSON.stringify(this.props.view.filters_ast)
        })
 }

    tagsChange = (value, text, $selectedItem) => {
        this.updateSimpleRules({
            [TICKET_TAGS]: _.filter(value.split(','))
        })
    }

    assigneeChange = (value, text, $selectedItem) => {
        this.updateSimpleRules({
            [TICKET_ASSIGNEE]: Number(value) || null
        })
    }

    statusChange = (value, text, $selectedItem) => {
        this.updateSimpleRules({
            [TICKET_STATUS]: value || null
        })
    }

    renderTagsDropdown = () => {
        return (
            <FilterDropdown
                wrappedValue={_.map(this.props.allTags, 'name')}
                header="Tags"
                placeholder="Search tags..."
                onChange={this.tagsChange}
                options={{maxSelections: 3}}
                selected={(this.props.view.simpleRules[TICKET_TAGS])}
                multiple
                />
        )
    }

    renderAssigneeDropdown = () => {
        return (
            <FilterDropdown
                wrappedValue={this.props.allUsers}
                header="Assignee"
                onChange={this.assigneeChange}
                selected={this.props.view.simpleRules[TICKET_ASSIGNEE]}
                placeholder="Search users..."
                />
        )
    }

    renderStatusDropdown = () => {
        return (
            <FilterDropdown
                wrappedValue={TICKET_STATUSES}
                header="Status"
                onChange={this.statusChange}
                selected={this.props.view.simpleRules[TICKET_STATUS]}
                placeholder="Search statuses..."
                />
        )
    }

    renderShowMoreFieldsDropdown = () => {
        // Only render jQuery-laden initialision once we have the columns
        if (_.isEmpty(this.props.columns)) {
            return null
        }

        return (
            <ShowMoreFieldsDropdown
                columns={_.map(this.props.columns, 'name')}
                updateView={this.updateView}
                />
        )
    }

    saveView = () => {
        this.updateView(_.pick(this.props.view, ['filters', 'filters_ast']))
    }

    updateView = (data) => {
        const view = this.props.view
        return this.props.actions.view.updateView(view.id, view.slug, data)
    }

     renderSaveView = () => {
        if (!this.props.view.dirty) {
            return null
        }

        return (
            <div>
                <button className="ui blue button" onClick={this.saveView}>Save</button>
            </div>
        )
     }

    renderTopbar() {
        // Only render the topbar once we have the values to initialise with
        if (_.isEmpty(this.props.view.simpleRules)) {
            return null
        }

        return (
            <div className="ui text menu">
                <a className="ui dropdown item top-dropdowns">
                    {this.renderShowMoreFieldsDropdown()}
                    {this.renderAssigneeDropdown()}
                    {this.renderTagsDropdown()}
                    {this.renderStatusDropdown()}
                    {this.renderSaveView()}
                </a>
                <div className="right menu item">
                    <div className="item">
                        <Search />
                    </div>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div className="TicketsView" key={this.props.view.slug}>
                {this.renderTopbar()}

                <h1 className="ui header">{this.props.view.name}</h1>
                <TicketTable
                    tickets={this.props.tickets}
                    columns={this.props.columns}
                    allTags={this.props.allTags}
                    allUsers={this.props.allUsers}
                    currentUser={this.props.currentUser}
                    pushState={this.props.pushState}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    tickets: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            header: PropTypes.string.isRequired,
            width: PropTypes.number.isRequired,
            sortable: PropTypes.bool.isRequired,
        })
    ).isRequired,
    allTags: PropTypes.array.isRequired,
    allUsers: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
}

