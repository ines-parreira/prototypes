import React, {PropTypes} from 'react'
import TicketTable from './TicketTable'
import ShowMoreFieldsDropdown from './ShowMoreFieldsDropdown'
import Search from '../Search'
import FilterDropdown from './FilterDropdown'
import { TICKET_TAGS, TICKET_ASSIGNEE, TICKET_STATUS, TICKET_STATUSES } from '../../constants'


export default class TicketsView extends React.Component {
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

    updateView = (data) => {
        const view = this.props.view
        return this.props.actions.view.updateView(view.id, view.slug, data)
    }

    renderTopbar() {
        return (
            <div className="ui text menu">
                <a className="ui dropdown item top-dropdowns">
                    {this.renderShowMoreFieldsDropdown()}
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

