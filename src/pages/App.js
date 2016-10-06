import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import DocumentTitle from 'react-document-title'
import {fetchUser, fetchUsers} from '../state/users/actions'
import {fetchSettings} from '../state/settings/actions'
import {fetchTags} from '../state/tags/actions'
import {pollActivity} from '../state/activity/actions'
import Navbar from './common/components/Navbar'
import KeyboardHelp from './common/components/KeyboardHelp'
import Mousetrap from 'mousetrap'
import * as mousetrap from 'mousetrap'
import Notifications from 'react-notification-system-redux'
import {NOTIFICATIONS_STYLE_CONFIG} from '../config'
import '../../css/main.less'

let pollInterval = null
class App extends React.Component {
    componentWillMount() {
        this.props.fetchUsers()
        this.props.fetchUsers(['agent', 'admin'])

        // activity polling
        let shouldPoll = true
        const pollingParameter = this.props.location.query._activity_polling || ''
        const pollingConfiguration = window.DISABLE_ACTIVITY_POLLING || ''

        if (pollingParameter) {
            shouldPoll = pollingParameter === 'true'
        } else if (pollingConfiguration) {
            shouldPoll = pollingConfiguration === 'False'
        }

        if (shouldPoll) {
            if (pollInterval) {
                clearInterval(pollInterval)
            }

            pollInterval = setInterval(this.props.pollActivity, 5000)
        }

        this.props.pollActivity()
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

                    <Notifications
                        notifications={this.props.notifications}
                        style={NOTIFICATIONS_STYLE_CONFIG}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

App.propTypes = {
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
    location: PropTypes.object,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: PropTypes.node,
    infobar: PropTypes.node,
    activeContent: PropTypes.object,

    content: PropTypes.node,
    notifications: PropTypes.array
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        activity: state.activity,
        notifications: state.notifications
    }
}

export default connect(mapStateToProps, {
    fetchUser,
    fetchUsers,
    fetchSettings,
    fetchTags,
    pollActivity
})(App)
