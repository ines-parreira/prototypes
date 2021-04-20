// @flow
import classnames from 'classnames'
import React, {type ComponentType, type Node} from 'react'
import DocumentTitle from 'react-document-title'
import {connect} from 'react-redux'
import {Button, Container} from 'reactstrap'
import NotificationsSystem from 'reapop'

import '../../css/main.less'
import pendingMessageManager from '../services/pendingMessageManager'
import pollingManager from '../services/pollingManager'
import shortcutManager from '../services/shortcutManager/index.ts'
import userActivityManager from '../services/userActivityManager'
import statusPageManager from '../services/statusPageManager'
import * as layoutActions from '../state/layout/actions.ts'
import * as layoutSelectors from '../state/layout/selectors.ts'
import type {currentAccountType, currentUserType} from '../state/types'
import * as viewsActions from '../state/views/actions.ts'
import * as viewsSelectors from '../state/views/selectors.ts'
import * as segmentTracker from '../store/middlewares/segmentTracker'
import type {reactRouterLocation} from '../types'
import {injectInterceptor} from '../utils/axios.ts'
import {handleUsageBanner} from '../state/notifications/actions.ts'
import {hasIntegrationOfTypes} from '../state/integrations/selectors.ts'
import {IntegrationType} from '../models/integration/types.ts'

import css from './App.less'
import BannerNotifications from './common/components/BannerNotifications/'
import FullPage from './common/components/FullPage.tsx'
import KeyboardHelp from './common/components/KeyboardHelp/KeyboardHelp.tsx'
import ModalNotification from './common/components/ModalNotification.tsx'
import notificationsTheme from './common/components/Notifications.ts'
import {ErrorBoundary} from './ErrorBoundary'
import PhoneIntegrationBar from './common/components/PhoneIntegrationBar/PhoneIntegrationBar.tsx'

type Props = {
    // current logged in user
    currentUser: currentUserType,
    currentAccount: currentAccountType,
    infobarOnMobile?: boolean,
    isEditingWidgets?: boolean,
    containerPadding?: boolean,
    noContainerWidthLimit?: boolean,
    injectInterceptor: typeof injectInterceptor,
    handleUsageBanner: typeof handleUsageBanner,
    fetchVisibleViewsCounts: typeof viewsActions.fetchVisibleViewsCounts,
    openPanel: typeof layoutActions.openPanel,
    closePanels: typeof layoutActions.closePanels,
    gotoActiveView: typeof viewsActions.gotoActiveView,
    hasPhoneIntegration: boolean,

    openedPanel?: string,

    // Injected by React Router
    children: Node,
    params?: {},
    location: reactRouterLocation,

    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: ComponentType<any>,
    infobar: ComponentType<any>,
    activeContent: {},

    content: ComponentType<any>,
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
        const {
            notifications,
            openedPanel,
            infobarOnMobile,
            isEditingWidgets,
            noContainerWidthLimit,
            containerPadding,
            content: Content,
            navbar: Navbar,
            infobar: Infobar,
            hasPhoneIntegration,
            children,
        } = this.props
        const bannerNotifications = notifications.filter(
            (notif) => notif.style === 'banner'
        )
        const modalNotifications = notifications.filter(
            (notif) => notif.style === 'modal'
        )

        const Wrapper = containerPadding ? FullPage : Container
        const wrapperProps = containerPadding
            ? {noContainerWidthLimit}
            : {fluid: true, className: classnames(css['main-content'])}
        const content = !!Content ? <Content /> : children

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
                            <Navbar />

                            <div
                                className={classnames(
                                    'd-flex flex-grow-1 flex-column',
                                    css.container
                                )}
                            >
                                <div
                                    className="d-flex flex-grow-1"
                                    style={{
                                        overflow: 'hidden',
                                    }}
                                >
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
                                                    this.props.openPanel(
                                                        'navbar'
                                                    )
                                                }
                                            >
                                                <i className="material-icons">
                                                    menu
                                                </i>
                                            </Button>
                                            {infobarOnMobile && (
                                                <Button
                                                    className="ml-3"
                                                    type="button"
                                                    color="link"
                                                    onClick={() =>
                                                        this.props.openPanel(
                                                            'infobar'
                                                        )
                                                    }
                                                >
                                                    More info
                                                </Button>
                                            )}
                                        </div>

                                        <Wrapper {...wrapperProps}>
                                            <ErrorBoundary>
                                                {content}
                                            </ErrorBoundary>
                                        </Wrapper>
                                    </div>

                                    {!!Infobar && (
                                        <Infobar
                                            isEditingWidgets={
                                                !!isEditingWidgets
                                            }
                                        />
                                    )}
                                </div>
                                {hasPhoneIntegration && <PhoneIntegrationBar />}
                            </div>

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

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        currentAccount: state.currentAccount,
        notifications: state.notifications,
        openedPanel: layoutSelectors.getCurrentOpenedPanel(state),
        activeView: viewsSelectors.getActiveView(state),
        hasPhoneIntegration: hasIntegrationOfTypes(
            IntegrationType.PhoneIntegrationType
        )(state),
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
