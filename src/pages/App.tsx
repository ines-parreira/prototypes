import classnames from 'classnames'
import React, {ComponentType, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'
import NotificationsSystem, {
    dismissNotification,
    Notification as ReapopNotification,
} from 'reapop'
import {RouteComponentProps} from 'react-router-dom'
import {Map} from 'immutable'

import 'assets/css/main.less'
import {getAccessSettings} from 'state/currentAccount/selectors'
import pendingMessageManager from 'services/pendingMessageManager/pendingMessageManager'
import pollingManager from 'services/pollingManager'
import shortcutManager from 'services/shortcutManager'
import userActivityManager from 'services/userActivityManager'
import statusPageManager from 'services/statusPageManager/statusPageManager'
import * as layoutActions from 'state/layout/actions'
import * as layoutSelectors from 'state/layout/selectors'
import {RootState} from 'state/types'
import * as viewsActions from 'state/views/actions'
import {identifyUser} from 'store/middlewares/segmentTracker'
import {handleUsageBanner} from 'state/notifications/actions'
import {hasIntegrationOfTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'

import {handle2FAEnforced} from 'state/currentUser/actions'
import css from './App.less'
import BannerNotifications from './common/components/BannerNotifications/BannerNotifications'
import FullPage from './common/components/FullPage'
import KeyboardHelp from './common/components/KeyboardHelp/KeyboardHelp'
import notificationsTheme from './common/components/Notifications'
import {NotificationIcon as GorgiasNotificationIcon} from './common/components/NotificationIcon'
import {ErrorBoundary} from './ErrorBoundary'
import PhoneIntegrationBar from './common/components/PhoneIntegrationBar/PhoneIntegrationBar'
import IconButton from './common/components/button/IconButton'
import Button from './common/components/button/Button'

type Props = {
    infobarOnMobile?: boolean
    isEditingWidgets?: boolean
    containerPadding?: boolean
    noContainerWidthLimit?: boolean
    children?: ReactNode
    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: ComponentType<any>
    infobar?: ComponentType<any>
    content?: ComponentType<any>
} & ConnectedProps<typeof connector> &
    RouteComponentProps

class App extends React.Component<Props> {
    componentDidMount() {
        const item = this.props.currentAccount
        const newAccountStatus = item.getIn(['status', 'status'])
        const notification: Map<any, any> | undefined = item.getIn([
            'status',
            'notification',
        ])

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
        identifyUser(this.props.currentUser.toJS())

        this.props.handle2FAEnforced()
    }

    componentWillUnmount() {
        shortcutManager.unbind('App')
        pollingManager.stop()
        statusPageManager.stopPolling()
    }

    componentWillReceiveProps(nextProps: Props) {
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
            dismissNotification,
        } = this.props
        const bannerNotifications = notifications.filter(
            (notif) => notif.style === 'banner'
        )

        const alertNotifications = notifications.filter(
            (notif) => notif.style === 'alert'
        ) as ReapopNotification[]

        const Wrapper = containerPadding ? FullPage : Container
        const wrapperProps = containerPadding
            ? {noContainerWidthLimit}
            : {fluid: true, className: classnames(css['main-content'])}
        const content = !!Content ? <Content /> : children

        const hasOpenedPanel = !!openedPanel

        return (
            <ErrorBoundary>
                <div className={classnames(css.page)}>
                    <BannerNotifications notifications={bannerNotifications} />

                    <div id="app-root" className={css.app}>
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
                                        <IconButton
                                            className="mr-3"
                                            fillStyle="ghost"
                                            intent="secondary"
                                            onClick={() =>
                                                this.props.openPanel('navbar')
                                            }
                                        >
                                            menu
                                        </IconButton>
                                        {infobarOnMobile && (
                                            <Button
                                                className="ml-3"
                                                fillStyle="ghost"
                                                intent="secondary"
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
                                        <ErrorBoundary>{content}</ErrorBoundary>
                                    </Wrapper>
                                </div>

                                {!!Infobar && (
                                    <Infobar
                                        isEditingWidgets={!!isEditingWidgets}
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
                        notifications={alertNotifications}
                        dismissNotification={dismissNotification}
                        components={{
                            NotificationIcon: GorgiasNotificationIcon,
                        }}
                    />
                </div>
            </ErrorBoundary>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
        currentAccount: state.currentAccount,
        currentAccountAccessSettings: getAccessSettings(state),
        notifications: state.notifications,
        openedPanel: layoutSelectors.getCurrentOpenedPanel(state),
        hasPhoneIntegration: hasIntegrationOfTypes(IntegrationType.Phone)(
            state
        ),
    }),
    {
        fetchVisibleViewsCounts: viewsActions.fetchVisibleViewsCounts,
        openPanel: layoutActions.openPanel,
        closePanels: layoutActions.closePanels,
        gotoActiveView: viewsActions.gotoActiveView,
        handleUsageBanner: handleUsageBanner,
        dismissNotification: dismissNotification,
        handle2FAEnforced: handle2FAEnforced,
    }
)

export default connector(React.memo(App, _isEqual))
