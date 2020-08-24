// @flow
import classnames from 'classnames'
import React, {type Node} from 'react'
import DocumentTitle from 'react-document-title'
import {connect} from 'react-redux'
import {Button, Container} from 'reactstrap'
import NotificationsSystem from 'reapop'

import '../../css/main.less'
import pendingMessageManager from '../services/pendingMessageManager'
import pollingManager from '../services/pollingManager'
import shortcutManager from '../services/shortcutManager'
import userActivityManager from '../services/userActivityManager'
import statusPageManager from '../services/statusPageManager'
import * as layoutActions from '../state/layout/actions.ts'
import * as layoutSelectors from '../state/layout/selectors.ts'
import type {currentAccountType, currentUserType} from '../state/types'
import * as viewsActions from '../state/views/actions'
import * as viewsSelectors from '../state/views/selectors'
import * as segmentTracker from '../store/middlewares/segmentTracker'
import type {reactRouterLocation} from '../types'
import * as utils from '../utils'
import {injectInterceptor} from '../utils/axios'
import {handleUsageBanner} from '../state/notifications/actions.ts'

import css from './App.less'
import BannerNotifications from './common/components/BannerNotifications/'
import FullPage from './common/components/FullPage'
import KeyboardHelp from './common/components/KeyboardHelp'
import ModalNotification from './common/components/ModalNotification'
import notificationsTheme from './common/components/Notifications'
import {ErrorBoundary} from './ErrorBoundary'

type Props = {
    // current logged in user
    currentUser: currentUserType,
    currentAccount: currentAccountType,
    currentRoute: {
        infobarOnMobile?: boolean,
        containerPadding?: boolean,
    },
    injectInterceptor: typeof injectInterceptor,
    handleUsageBanner: typeof handleUsageBanner,
    fetchVisibleViewsCounts: typeof viewsActions.fetchVisibleViewsCounts,
    openPanel: typeof layoutActions.openPanel,
    closePanels: typeof layoutActions.closePanels,
    gotoActiveView: typeof viewsActions.gotoActiveView,

    openedPanel?: string,

    // Injected by React Router
    children: Node,
    params?: {},
    location: reactRouterLocation,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: Node,
    infobar: Node,
    activeContent: {},

    content: Node,
    notifications: Array<*>,
}

class App extends React.Component<Props> {
    componentWillMount() {
        this.props.injectInterceptor()

        const item = this.props.currentAccount
        const newAccountStatus = item.getIn(['status', 'status'])
        const notification = item.getIn(['status', 'notification'])
        this.props.handleUsageBanner({
            newAccountStatus,
            notification: notification ? notification.toJS() : null,
            currentAccountStatus: newAccountStatus,
        })

        userActivityManager.watch()
        pollingManager.start()
        statusPageManager.startPolling()

        // ask for the newest view counts
        this.props.fetchVisibleViewsCounts()
    }

    componentDidMount() {
        shortcutManager.bind('App', {
            GO_VIEW: {
                action: (e) => {
                    e.preventDefault()
                    this.props.gotoActiveView()
                },
            },
            UNDO_MESSAGE: {
                action: () => pendingMessageManager.undoMessage(),
            },
        })
        segmentTracker.identifyUser(this.props.currentUser.toJS())
    }

    componentWillUnmount() {
        shortcutManager.unbind('App')
        pollingManager.stop()
        statusPageManager.stopPolling()
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
        const bannerNotifications = notifications.filter(
            (notif) => notif.style === 'banner'
        )
        const modalNotifications = notifications.filter(
            (notif) => notif.style === 'modal'
        )

        const hasOpenedPanel = !!openedPanel

        return (
            <DocumentTitle title="Gorgias">
                <ErrorBoundary>
                    <div className={classnames(css.page)}>
                        <BannerNotifications
                            notifications={bannerNotifications}
                        />

                        {modalNotifications.map((notification) => (
                            <ModalNotification
                                key={notification.id}
                                {...notification}
                            />
                        ))}

                        <div className={css.app}>
                            {this.props.navbar}

                            <div
                                className={classnames(
                                    'app-content',
                                    css.content
                                )}
                            >
                                <div className="mobile-nav d-md-none d-flex justify-content-between align-items-center">
                                    <Button
                                        className="mr-3"
                                        type="button"
                                        color="link"
                                        onClick={() =>
                                            this.props.openPanel('navbar')
                                        }
                                    >
                                        <i className="material-icons">menu</i>
                                    </Button>
                                    {currentRoute.infobarOnMobile && (
                                        <Button
                                            className="ml-3"
                                            type="button"
                                            color="link"
                                            onClick={() =>
                                                this.props.openPanel('infobar')
                                            }
                                        >
                                            More info
                                        </Button>
                                    )}
                                </div>
                                {currentRoute.containerPadding ? (
                                    <FullPage>
                                        <ErrorBoundary>
                                            {this.props.content ||
                                                this.props.children}
                                        </ErrorBoundary>
                                    </FullPage>
                                ) : (
                                    <Container
                                        fluid
                                        className={classnames(
                                            css['main-content']
                                        )}
                                    >
                                        <ErrorBoundary>
                                            {this.props.content ||
                                                this.props.children}
                                        </ErrorBoundary>
                                    </Container>
                                )}
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
                            filter={(n) => n.style === 'alert'}
                        />
                    </div>
                </ErrorBoundary>
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
    injectInterceptor: injectInterceptor,
    fetchVisibleViewsCounts: viewsActions.fetchVisibleViewsCounts,
    openPanel: layoutActions.openPanel,
    closePanels: layoutActions.closePanels,
    gotoActiveView: viewsActions.gotoActiveView,
    handleUsageBanner: handleUsageBanner,
})(App)
