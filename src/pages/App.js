// @flow
import React from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Container, Button} from 'reactstrap'
import classnames from 'classnames'
import NotificationsSystem from 'reapop'

import * as utils from '../utils'

import * as layoutActions from '../state/layout/actions'
import * as activityActions from '../state/activity/actions'
import * as viewsActions from '../state/views/actions'
import * as currentAccountActions from '../state/currentAccount/actions'
import {fetchUser, fetchUsers} from '../state/users/actions'
import {fetchSettings} from '../state/settings/actions'
import {fetchTags} from '../state/tags/actions'
import {injectInterceptor} from '../utils/axios'

import * as layoutSelectors from '../state/layout/selectors'

import * as segmentTracker from '../store/middlewares/segmentTracker'
import KeyboardHelp from './common/components/KeyboardHelp'
import socketManager from '../services/socketManager'

import notificationsTheme from './common/components/Notifications'
import shortcutManager from '../services/shortcutManager'
import BannerNotifications from './common/components/BannerNotifications/'
import ModalNotification from './common/components/ModalNotification'
import FullPage from './common/components/FullPage'
import {
    ACTIVE_VIEW_COUNT_POLLING_INTERVAL,
    ACTIVE_VIEW_POLLING_INTERVAL,
    CHAT_POLLING_INTERVAL,
    RECENT_VIEWS_COUNTS_POLLING_INTERVAL
} from '../config'


import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-bootstrap-daterangepicker/css/daterangepicker.css'
import 'font-awesome/css/font-awesome.css'

import '../../css/main.less'
import css from './App.less'


import type {reactRouterLocation} from '../types'
import type {Node} from 'react'
import type {currentUserType, currentAccountType} from '../state/types'

type Props = {
    // current logged in user
    currentUser: currentUserType,
    currentAccount: currentAccountType,

    currentRoute: {
        infobarOnMobile?: boolean,
        noContainerPadding?: boolean,
    },
    fetchUser: typeof fetchUser,
    fetchUsers: typeof fetchUsers,
    fetchSettings: typeof fetchSettings,
    fetchTags: typeof fetchTags,
    injectInterceptor: typeof injectInterceptor,
    fetchActiveViewCount: typeof viewsActions.fetchActiveViewCount,
    fetchRecentViewsCounts: typeof viewsActions.fetchRecentViewsCounts,
    fetchActiveViewTickets: typeof viewsActions.fetchActiveViewTickets,
    pollChats: typeof activityActions.pollChats,
    openPanel: typeof layoutActions.openPanel,
    closePanels: typeof layoutActions.closePanels,
    updateAccountSuccess: typeof currentAccountActions.updateAccountSuccess,

    openedPanel?: string,

    // Injected by React Router
    children?: any,
    params?: {},
    location: reactRouterLocation,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: Node,
    infobar: Node,
    activeContent: {},

    content: any,
    notifications: Array<*>,
}


class App extends React.Component<Props> {
    componentWillMount() {
        this.props.fetchUsers(['agent', 'admin', 'bot'])
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
            setInterval(this.props.pollChats, CHAT_POLLING_INTERVAL)
            setInterval(this.props.fetchActiveViewTickets, ACTIVE_VIEW_POLLING_INTERVAL)
            setInterval(this.props.fetchActiveViewCount, ACTIVE_VIEW_COUNT_POLLING_INTERVAL)
            setInterval(this.props.fetchRecentViewsCounts, RECENT_VIEWS_COUNTS_POLLING_INTERVAL)
        }

        this.props.pollChats()
        this.props.injectInterceptor()

        // We're triggering an account update the first time the app is mounted so we can get
        // the notification from the middleware for limited (Ex: disabled, free trial ending) accounts
        this.props.updateAccountSuccess(this.props.currentAccount)
    }

    componentDidMount() {
        shortcutManager.bind('App')
        segmentTracker.identifyUser(this.props.currentUser.toJS())
    }

    componentWillUnmount() {
        shortcutManager.unbind('App')
        socketManager.disconnect()
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
                            <BannerNotifications notifications={bannerNotifications}/>

                            <div className="mobile-nav hidden-md-up d-flex justify-content-between align-items-center">
                                <Button
                                    className="mr-3"
                                    type="button"
                                    color="link"
                                    onClick={() => this.props.openPanel('navbar')}
                                >
                                    <i className="fa fa-fw fa-bars"/>
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

                    <KeyboardHelp/>

                    <NotificationsSystem
                        theme={notificationsTheme}
                        filter={n => n.style === 'alert'}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        currentUser: state.currentUser,
        currentAccount: state.currentAccount,
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
    injectInterceptor: injectInterceptor,
    fetchActiveViewCount: viewsActions.fetchActiveViewCount,
    fetchRecentViewsCounts: viewsActions.fetchRecentViewsCounts,
    fetchActiveViewTickets: viewsActions.fetchActiveViewTickets,
    pollChats: activityActions.pollChats,
    openPanel: layoutActions.openPanel,
    closePanels: layoutActions.closePanels,
    updateAccountSuccess: currentAccountActions.updateAccountSuccess,
})(App)
