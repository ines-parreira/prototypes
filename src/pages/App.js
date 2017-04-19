import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Container} from 'reactstrap'
import classnames from 'classnames'
import _forEach from 'lodash/forEach'
import _last from 'lodash/last'

import {fetchUser, fetchUsers} from '../state/users/actions'
import {fetchSettings} from '../state/settings/actions'
import {fetchTags} from '../state/tags/actions'
import {setUserProperties} from '../store/middlewares/amplitudeTracker'
import KeyboardHelp from './common/components/KeyboardHelp'
import SocketIO from './common/utils/socketio'
import Notifications from 'react-notification-system-redux'
import {NOTIFICATIONS_STYLE_CONFIG, POLL_ACTIVITY_INTERVAL, CHAT_POLLING_INTERVAL} from '../config'
import shortcutManager from './common/utils/shortcutManager'
import BannerNotifications from './common/components/BannerNotifications/'
import ModalNotification from './common/components/ModalNotification'
import FullPage from './common/components/FullPage'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-bootstrap-daterangepicker/css/daterangepicker.css'
import 'font-awesome/css/font-awesome.css'

import '../../css/main.less'

import css from './App.less'

import * as activityActions from '../state/activity/actions'

const intervals = {}
class App extends React.Component {
    componentWillMount() {
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
            _forEach(intervals, interval => clearInterval(interval))

            intervals.activity = setInterval(this.props.pollActivity, POLL_ACTIVITY_INTERVAL)
            intervals.chats = setInterval(this.props.pollChats, CHAT_POLLING_INTERVAL)
        }

        this.props.pollActivity()
        this.props.pollChats()
    }

    componentDidMount() {
        shortcutManager.bind('App')
        // define Amplitude user properties
        setUserProperties(this.props.currentUser.toJS())
    }

    componentWillUnmount() {
        const io = new SocketIO()
        shortcutManager.unbind('App')
        io.disconnect()
    }

    render() {
        const {notifications, routes} = this.props
        const bannerNotifications = notifications.filter(notif => notif.style === 'banner')
        const modalNotifications = notifications.filter(notif => notif.style === 'modal')
        const alertNotifications = notifications.filter(notif => notif.style === 'alert')

        const currentRoute = _last(routes)

        return (
            <DocumentTitle title="Gorgias">
                <div className={classnames(css.page)}>
                    <BannerNotifications notifications={bannerNotifications} />

                    {
                        modalNotifications.map((notification) => (
                            <ModalNotification
                                key={notification.uid}
                                {...notification}
                            />
                        ))
                    }

                    <div className={css.app}>
                        {this.props.navbar}

                        {
                            currentRoute.noContainerPadding ? (
                                    <Container
                                        fluid
                                        className={classnames(css['main-content'])}
                                    >
                                        {this.props.content || this.props.children}
                                    </Container>
                                ) : (
                                    <FullPage>
                                        {this.props.content || this.props.children}
                                    </FullPage>
                                )
                        }

                        {this.props.infobar}
                    </div>

                    <KeyboardHelp />

                    <Notifications
                        notifications={alertNotifications}
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

    fetchUser: PropTypes.func.isRequired,
    fetchUsers: PropTypes.func.isRequired,
    fetchSettings: PropTypes.func.isRequired,
    fetchTags: PropTypes.func.isRequired,
    pollActivity: PropTypes.func.isRequired,
    pollChats: PropTypes.func.isRequired,

    // Injected by React Router
    children: PropTypes.node,
    params: PropTypes.object.isRequired,
    location: PropTypes.object,
    routes: PropTypes.array.isRequired,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: PropTypes.node,
    infobar: PropTypes.node,
    activeContent: PropTypes.object,

    content: PropTypes.node,
    notifications: PropTypes.array,
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        notifications: state.notifications
    }
}

export default connect(mapStateToProps, {
    fetchUser,
    fetchUsers,
    fetchSettings,
    fetchTags,
    pollActivity: activityActions.pollActivity,
    pollChats: activityActions.pollChats,
})(App)
