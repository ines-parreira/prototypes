import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { dismissMessage } from '../actions/systemMessage'
import { fetchUser } from '../actions/user'

import TicketsSidebarContainer from './TicketsSidebar'
import KeyboardHelp from '../components/KeyboardHelp'

import * as mousetrap from 'mousetrap'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.handleDismissClick = this.handleDismissClick.bind(this)
    }

    componentWillMount() {
        // fetch currently logged-in user
        this.props.fetchUser(0)
    }

    componentDidMount() {
        // Initialize semantic-ui dropdowns
        // $('.ui.dropdown').dropdown()
        const props = this.props

        // Some global keyboard shortcuts

        // Go home (or dashboard)
        mousetrap.bind('g h', (e) => {
            props.pushState(null, '/')
        })
    }

    handleDismissClick(e) {
        e.preventDefault()
        this.props.dismissMessage()
    }

    // Show errors, warnings, info and success messages
    renderSystemMessage() {
        const systemMessage = this.props.systemMessage.toJS()
        if (Object.keys(systemMessage).length === 0) {
            return null
        }

        // map message.type to semantic ui classes
        const messageType = {
            neutral: '',
            error: 'negative',
            warning: 'warning',
            info: 'info',
            success: 'success'
        }[systemMessage.type]

        return (
            <div className={`ui ${messageType} message`}>
                <i className="close icon" onClick={this.handleDismissClick}/>
                <div className="header">{systemMessage.header}</div>
                <p>{systemMessage.msg}</p>
            </div>
        )
    }

    render() {
        return (
            <div className="App">
                {this.props.sidebar || <TicketsSidebarContainer />}
                <div className="main-content pusher">
                    {this.renderSystemMessage()}
                    {this.props.content || this.props.children}
                </div>
                <KeyboardHelp />
            </div>
        )
    }
}

App.propTypes = {
    // System Message handling (errors, info, success..)
    systemMessage: PropTypes.shape({
        type: PropTypes.oneOf(['neutral', 'error', 'warning', 'info', 'success']),
        header: PropTypes.string, // high level description
        msg: PropTypes.string // what the user should do? Try again? Contact support?
    }),
    dismissMessage: PropTypes.func.isRequired,

    // current logged in user
    currentUser: PropTypes.object,
    fetchUser: PropTypes.func.isRequired,

    // Injected by React Redux
    pushState: PropTypes.func.isRequired,

    // Injected by React Router
    children: PropTypes.node,

    // Sidebar containers can be changed depending on the route. See `routes.js`
    sidebar: PropTypes.node,
    content: PropTypes.node
}

function mapStateToProps(state) {
    return {
        systemMessage: state.systemMessage,
        currentUser: state.currentUser
    }
}

export default connect(mapStateToProps, {
    dismissMessage,
    fetchUser,
    pushState
})(App)
