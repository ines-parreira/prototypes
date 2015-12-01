import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import TicketTable from '../components/ticket/TicketTable'
import Search from '../components/Search'
import * as TicketActions from '../actions/ticket'

class TicketView extends React.Component {
    componentWillMount() {
        this.props.actions.fetchView(`/api/tickets/?view=${this.props.slug}`)
    }

    render() {
        return (
            <div className="TicketView">
                <div className="ui secondary menu">
                    <a className="active item">Show more fields</a>

                    <div className="right menu">
                        <div className="item">
                            <Search />
                        </div>
                    </div>
                </div>

                <h1 className="ui header">{this.props.title}</h1>
                <TicketTable tickets={this.props.tickets}/>
            </div>
        )
    }
}

TicketView.propTypes = {
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    tickets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        tickets: state.tickets,
        error: state.error
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TicketActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketView)
