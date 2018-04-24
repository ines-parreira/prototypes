// @flow
import React from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Container, Button} from 'reactstrap'
import classnames from 'classnames'
import NotificationsSystem from 'reapop'

import * as utils from '../utils'

import * as layoutActions from '../state/layout/actions'
import * as viewsActions from '../state/views/actions'
import * as currentAccountActions from '../state/currentAccount/actions'
import {fetchUser} from '../state/users/actions'
import {injectInterceptor} from '../utils/axios'

import * as layoutSelectors from '../state/layout/selectors'
import * as viewsSelectors from '../state/views/selectors'

import * as segmentTracker from '../store/middlewares/segmentTracker'
import KeyboardHelp from './common/components/KeyboardHelp'
import socketManager from '../services/socketManager'

import notificationsTheme from './common/components/Notifications'
import shortcutManager from '../services/shortcutManager'
import BannerNotifications from './common/components/BannerNotifications/'
import ModalNotification from './common/components/ModalNotification'
import FullPage from './common/components/FullPage'
import userActivityManager from '../services/userActivityManager'
import pollingManager from '../services/pollingManager'

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
        containerPadding?: boolean,
    },
    fetchUser: typeof fetchUser,
    injectInterceptor: typeof injectInterceptor,
    fetchVisibleViewsCounts: typeof viewsActions.fetchVisibleViewsCounts,
    openPanel: typeof layoutActions.openPanel,
    closePanels: typeof layoutActions.closePanels,
    updateAccountSuccess: typeof currentAccountActions.updateAccountSuccess,
    gotoActiveView: typeof viewsActions.gotoActiveView,

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
        this.props.injectInterceptor()
        // We're triggering an account update the first time the app is mounted so we can get
        // the notification from the middleware for limited (Ex: disabled, free trial ending) accounts
        this.props.updateAccountSuccess(this.props.currentAccount)
        userActivityManager.watch()
        pollingManager.start()

        // ask for the newest view counts
        this.props.fetchVisibleViewsCounts()
    }

    componentDidMount() {
        shortcutManager.bind('App', {
            GO_VIEW: {
                action: (e) => {
                    e.preventDefault()
                    this.props.gotoActiveView()
                }
            },
        })
        segmentTracker.identifyUser(this.props.currentUser.toJS())
    }

    componentWillUnmount() {
        shortcutManager.unbind('App')
        socketManager.disconnect()
        pollingManager.stop()
    }

    componentWillReceiveProps(nextProps) {
        const isUserActive = this.props.currentUser.get('is_active')
        const isNextUserActive = nextProps.currentUser.get('is_active')

        if (isUserActive && !isNextUserActive) {
            // Stop polling when current user becomes inactive
            pollingManager.stop()
        } else if (!isUserActive && isNextUserActive) {
            // Start polling when current user becomes active
            pollingManager.start()
        }
    }

    render() {
        const {notifications, openedPanel, currentRoute} = this.props
        const bannerNotifications = notifications.filter(notif => notif.style === 'banner')
        const modalNotifications = notifications.filter(notif => notif.style === 'modal')

        const hasOpenedPanel = !!openedPanel

        return (
            <DocumentTitle title="Gorgias">
                <div className={classnames(css.page)}>
                    <BannerNotifications notifications={bannerNotifications}/>

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
                            <div className="mobile-nav d-md-none d-flex justify-content-between align-items-center">
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
                                currentRoute.containerPadding ? (
                                    <FullPage>
                                        {this.props.content || this.props.children}
                                    </FullPage>
                                ) : (
                                    <Container
                                        fluid
                                        className={classnames(css['main-content'])}
                                    >
                                        {this.props.content || this.props.children}
                                    </Container>
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
        activeView: viewsSelectors.getActiveView(state),
        currentRoute: utils.currentRoute(ownProps.routes),
    }
}

export default connect(mapStateToProps, {
    fetchUser,
    injectInterceptor: injectInterceptor,
    fetchVisibleViewsCounts: viewsActions.fetchVisibleViewsCounts,
    openPanel: layoutActions.openPanel,
    closePanels: layoutActions.closePanels,
    updateAccountSuccess: currentAccountActions.updateAccountSuccess,
    gotoActiveView: viewsActions.gotoActiveView,
})(App)
