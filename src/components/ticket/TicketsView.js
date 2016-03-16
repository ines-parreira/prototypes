import React, {PropTypes} from 'react'
import TicketTable from './TicketTable'
import ShowMoreFieldsDropdown from './ShowMoreFieldsDropdown'


export default class TicketsView extends React.Component {
    renderShowMoreFieldsDropdown = () => {
        // Only render jQuery-laden initialision once we have the columns
        if (this.props.columns.size === 0) {
            return null
        }

        return (
            <ShowMoreFieldsDropdown
                columns={this.props.columns.map((c) => c.get('name'))}
                updateView={this.updateView}
                />
        )
    }

    updateView = (data) => {
        const { id, slug } = this.props.view.toJS()
        return this.props.actions.view.updateView(id, slug, data)
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
            <div className="TicketsView" key={this.props.view.get('slug')}>
                {this.renderTopbar()}

                <h1 className="ui header">{this.props.view.get('name')}</h1>
                <TicketTable
                    actions={this.props.actions}
                    tickets={this.props.tickets}
                    columns={this.props.columns.toJS()}
                    allTags={this.props.allTags}
                    allUsers={this.props.allUsers}
                    currentUser={this.props.currentUser}
                    pushState={this.props.pushState}
                    fetchPage={this.props.fetchPage}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    actions: PropTypes.object.isRequired,
    tickets: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    columns: PropTypes.object.isRequired,
    allTags: PropTypes.array.isRequired,
    allUsers: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
    fetchPage: PropTypes.func.isRequired,
}

