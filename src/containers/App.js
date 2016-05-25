import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import { dismissMessage } from '../actions/systemMessage'
import { fetchUser, fetchUsers } from '../actions/user'
import { fetchSettings } from '../actions/settings'

import TicketsNavbarContainer from './TicketsNavbar'
import KeyboardHelp from '../components/KeyboardHelp'

import * as mousetrap from 'mousetrap'
import '../../css/main.less'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.handleDismissClick = this.handleDismissClick.bind(this)
    }

    componentWillMount() {
        // fetch currently logged-in user
        this.props.fetchUser(0)
        this.props.fetchSettings()
        this.props.fetchUsers()
        this.props.fetchUsers('agent')
    }

    componentDidMount() {
        // Some global keyboard shortcuts

        // Go home (or dashboard)
        mousetrap.bind('g h', (e) => {
            browserHistory.push('/')
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

        const msg = typeof systemMessage.msg === 'string' ? <p>{systemMessage.msg}</p> : systemMessage.msg

        return (
            <div id="system-message" className={`ui ${messageType} message`}>
                <i className="close icon" onClick={this.handleDismissClick}/>
                <div className="header">{systemMessage.header}</div>
                {msg}
            </div>
        )
    }

    renderLoader() {
        return null
        // no loader for now - we need to attach it to a state

        return (
            <div className="App-loader">
                <div className="ball-pulse-sync">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        )
    }

    render() {
        const systemMessage = this.renderSystemMessage()
        const height = systemMessage ? '90vh' : '100vh'
        const marginTop = systemMessage ? '10vh' : '0vh'

        return (
            <div className="App" style={{ height, marginTop }}>
                {systemMessage}
                {this.props.navbar || <TicketsNavbarContainer params={this.props.params}/>}
                <div className="App-content">
                    {this.renderLoader()}
                    <div className="main-content pusher">
                        {this.props.content || this.props.children}
                    </div>
                </div>
                {this.props.infobar}
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
    fetchUsers: PropTypes.func.isRequired,
    fetchSettings: PropTypes.func.isRequired,

    // Injected by React Router
    children: PropTypes.node,
    params: PropTypes.object.isRequired,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: PropTypes.node,
    infobar: PropTypes.node,

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
    fetchUsers,
    fetchSettings
})(App)
