import React, {PropTypes} from 'react'
import TicketTable from './TicketTable'
import ShowMoreFieldsDropdown from './ShowMoreFieldsDropdown'


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
            </div>
        )
    }
    render() {
        return (
            <div className="TicketsView" key={this.props.view.slug}>
                {this.renderTopbar()}

                <h1 className="ui header">{this.props.view.name}</h1>
                <TicketTable
                    actions={this.props.actions}
                    tickets={this.props.tickets}
                    view={this.props.view}
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
    actions: PropTypes.object.isRequired,
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

