import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Container, Button} from 'reactstrap'
import classnames from 'classnames'
import NotificationsSystem from 'reapop'

import * as utils from '../utils'

import * as layoutActions from '../state/layout/actions'
import {fetchUser, fetchUsers} from '../state/users/actions'
import {fetchSettings} from '../state/settings/actions'
import {fetchTags} from '../state/tags/actions'

import * as layoutSelectors from '../state/layout/selectors'

import {setUserProperties} from '../store/middlewares/amplitudeTracker'
import KeyboardHelp from './common/components/KeyboardHelp'
import SocketIO from './common/utils/socketio'

import {POLL_ACTIVITY_INTERVAL, CHAT_POLLING_INTERVAL} from '../config'

import notificationsTheme from './common/components/Notifications'
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
        const {notifications, openedPanel, currentRoute} = this.props
        const bannerNotifications = notifications.filter(notif => notif.style === 'banner')
        const modalNotifications = notifications.filter(notif => notif.style === 'modal')

        const hasOpenedPanel = !!openedPanel

        return (
            <DocumentTitle title="Gorgias">
                <div className={classnames(css.page)}>
                    {
                        modalNotifications.map((notification) => (
                            <ModalNotification
                                key={notification.id}
                                {...notification}
                            />
                        ))
                    }

                    <div className={css.app}>
                        {this.props.navbar}

                        <div className={classnames('app-content', css.content)}>
                            <BannerNotifications notifications={bannerNotifications} />

                            <div className="mobile-nav hidden-md-up d-flex justify-content-between align-items-center">
                                <Button
                                    className="mr-3"
                                    type="button"
                                    color="link"
                                    onClick={() => this.props.openPanel('navbar')}
                                >
                                    <i className="fa fa-fw fa-bars" />
                                </Button>
                                {
                                    currentRoute.infobarOnMobile && (
                                        <Button
                                            className="ml-3"
                                            type="button"
                                            color="link"
                                            onClick={() => this.props.openPanel('infobar')}
                                        >
                                            More info
                                        </Button>
                                    )
                                }
                            </div>
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
                        </div>

                        {this.props.infobar}

                        <div
                            className={classnames(css.backdrop, {
                                [css.hidden]: !hasOpenedPanel,
                            })}
                            onClick={this.props.closePanels}
                        />
                    </div>

                    <KeyboardHelp />

                    <NotificationsSystem
                        theme={notificationsTheme}
                        filter={n => n.style === 'alert'}
                    />
                </div>
            </DocumentTitle>
        )
    }
}


App.propTypes = {
    // current logged in user
    currentUser: PropTypes.object,

    currentRoute: PropTypes.object.isRequired,
    fetchUser: PropTypes.func.isRequired,
    fetchUsers: PropTypes.func.isRequired,
    fetchSettings: PropTypes.func.isRequired,
    fetchTags: PropTypes.func.isRequired,
    pollActivity: PropTypes.func.isRequired,
    pollChats: PropTypes.func.isRequired,
    openedPanel: PropTypes.string,
    openPanel: PropTypes.func.isRequired,
    closePanels: PropTypes.func.isRequired,

    // Injected by React Router
    children: PropTypes.node,
    params: PropTypes.object.isRequired,
    location: PropTypes.object,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: PropTypes.node,
    infobar: PropTypes.node,
    activeContent: PropTypes.object,

    content: PropTypes.node,
    notifications: PropTypes.array,
}

function mapStateToProps(state, ownProps) {
    return {
        currentUser: state.currentUser,
        notifications: state.notifications,
        openedPanel: layoutSelectors.getCurrentOpenedPanel(state),
        currentRoute: utils.currentRoute(ownProps.routes),
    }
}

export default connect(mapStateToProps, {
    fetchUser,
    fetchUsers,
    fetchSettings,
    fetchTags,
    pollActivity: activityActions.pollActivity,
    pollChats: activityActions.pollChats,
    openPanel: layoutActions.openPanel,
    closePanels: layoutActions.closePanels,
})(App)
