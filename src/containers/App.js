import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import DocumentTitle from 'react-document-title'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import {dismissMessage} from '../actions/systemMessage'
import {fetchUser, fetchUsers} from '../actions/user'
import {fetchSettings} from '../actions/settings'
import {fetchTags} from '../actions/tag'
import {pollActivity} from '../actions/activity'
import Navbar from '../components/Navbar'
import KeyboardHelp from '../components/KeyboardHelp'
import Mousetrap, * as mousetrap from 'mousetrap'
import {sanitizeHtmlDefault} from '../utils'
import '../../css/main.less'

let pollInterval = null
class App extends React.Component {
    constructor(props) {
        super(props)
        this._handleDismissClick = this._handleDismissClick.bind(this)
        this.messageTimeout = null
    }

    componentWillMount() {
        // fetch currently logged-in user
        this.props.fetchUser(0)
        this.props.fetchSettings()
        this.props.fetchUsers()
        this.props.fetchUsers(['agent', 'admin'])
        this.props.fetchTags()

        if (pollInterval) {
            clearInterval(pollInterval)
        }
        pollInterval = setInterval(() =>
            this.props.pollActivity(this.props.activity.get('pendingEvents')), 5000)
        // call it the first time without polling
        this.props.pollActivity(this.props.activity.get('pendingEvents'))
    }

    componentDidMount() {
        // Some global keyboard shortcuts

        Mousetrap.prototype.stopCallback = (e, element, combo) => {
            // if the element has the class "mousetrap" then no need to stop
            // also, if the combo includes 'mod', then the event should be triggered
            if ((` ${element.className} `).indexOf(' mousetrap ') > -1 || combo.indexOf('mod') > -1) {
                return false
            }

            // stop for input, select, and textarea
            return (
                element.tagName === 'INPUT' ||
                element.tagName === 'SELECT' ||
                element.tagName === 'TEXTAREA' ||
                (element.contentEditable && element.contentEditable === 'true')
            )
        }

        // Go home (or dashboard)
        mousetrap.bind('g h', () => {
            browserHistory.push('/app')
        })
    }

    componentDidUpdate() {
        if (Object.keys(this.props.systemMessage.toJS()).length !== 0 && this.props.systemMessage.get('modal')) {
            $('#system-message').modal({
                detachable: false
            }).modal('show')
        }
    }

    _handleDismissClick(e, modal = false) {
        if (e) {
            e.preventDefault()
        }

        if (modal) {
            $('#system-message').modal('hide')
        }

        this.props.dismissMessage()
    }

    // Show errors, warnings, info and success messages
    _renderSystemMessage() {
        clearTimeout(this.messageTimeout)
        const systemMessage = this.props.systemMessage.toJS()

        if (Object.keys(systemMessage).length === 0) {
            return null
        }

        let msg
        if (typeof systemMessage.msg === 'string') {
            const body = sanitizeHtmlDefault(systemMessage.msg)
            msg = <div dangerouslySetInnerHTML={{__html: body}}></div>
        } else {
            msg = systemMessage.msg
        }

        if (systemMessage.modal) {
            return this._renderModalSystemMessage(systemMessage, msg)
        }
        const messageType = {
            neutral: '',
            error: 'negative',
            warning: 'warning',
            info: 'info',
            success: 'success',
            loading: 'info'
        }[systemMessage.type]

        if (systemMessage.type === 'info' || systemMessage.type === 'success') {
            this.messageTimeout = setTimeout(this._handleDismissClick, 4500)
        }

        return (
            <ReactCSSTransitionGroup
                transitionAppear
                transitionName="fade"
                transitionAppearTimeout={200}
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}
            >
                <div id="system-message" className={`ui ${messageType} message`}>
                    <i className="close icon" onClick={this._handleDismissClick}/>
                    <div className="header">{systemMessage.header}</div>
                    {msg}
                </div>
            </ReactCSSTransitionGroup>
        )
    }

    _renderModalSystemMessage(systemMessage, msg) {
        return (
            <div id="system-message" className="ui modal">
                <i className="close icon" onClick={e => this._handleDismissClick(e, true)}/>
                <div className="header">{systemMessage.header}</div>
                <div className="content">
                    {systemMessage.options.title || ''}
                    <div>{msg}</div>
                </div>
                <div className="actions">
                    <div className="ui button" onClick={e => this._handleDismissClick(e, true)}>
                        Discard
                    </div>
                    {
                        () => {
                            // Render actions if any.
                            if (systemMessage.options.actions) {
                                return systemMessage.options.actions.map((action, idx) => (
                                    <div key={idx}
                                         className={action.className}
                                         onClick={(e) => { this._handleDismissClick(e, true); action.onClick() }}
                                    >
                                        {action.msg}
                                    </div>
                                ))
                            }
                            return null
                        }
                    }
                </div>
            </div>
        )
    }

    render() {
        return (
            <DocumentTitle title="Gorgias">
                <div className="App">

                    {/* default activeContent=users for now, shouldn't be any default in the end (specific navbar for each view) */}
                    {this.props.navbar || (
                        <Navbar activeContent="settings" currentUser={this.props.currentUser}>
                            <div></div>
                        </Navbar>
                    )}

                    <div className="App-content">
                        <div className="main-content pusher">
                            {this.props.content || this.props.children}
                        </div>
                    </div>

                    {this.props.infobar}

                    <KeyboardHelp />

                    {this._renderSystemMessage()}

                </div>
            </DocumentTitle>
        )
    }
}

App.propTypes = {
    // System Message handling (errors, info, success..)
    systemMessage: PropTypes.object,
    dismissMessage: PropTypes.func.isRequired,

    // current logged in user
    currentUser: PropTypes.object,
    activity: PropTypes.object,

    fetchUser: PropTypes.func.isRequired,
    fetchUsers: PropTypes.func.isRequired,
    fetchSettings: PropTypes.func.isRequired,
    fetchTags: PropTypes.func.isRequired,
    pollActivity: PropTypes.func.isRequired,

    // Injected by React Router
    children: PropTypes.node,
    params: PropTypes.object.isRequired,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: PropTypes.node,
    infobar: PropTypes.node,
    activeContent: PropTypes.object,

    content: PropTypes.node
}

function mapStateToProps(state) {
    return {
        systemMessage: state.systemMessage,
        currentUser: state.currentUser,
        activity: state.activity
    }
}

export default connect(mapStateToProps, {
    dismissMessage,
    fetchUser,
    fetchUsers,
    fetchSettings,
    fetchTags,
    pollActivity
})(App)
