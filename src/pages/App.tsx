import classnames from 'classnames'
import React, {ComponentType, ReactNode} from 'react'
import DocumentTitle from 'react-document-title'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Container} from 'reactstrap'
import NotificationsSystem from 'reapop'
import {RouteComponentProps} from 'react-router-dom'
import {Map} from 'immutable'

import '../../css/main.less'
import pendingMessageManager from '../services/pendingMessageManager/pendingMessageManager'
import pollingManager from '../services/pollingManager.js'
import shortcutManager from '../services/shortcutManager'
import userActivityManager from '../services/userActivityManager.js'
import statusPageManager from '../services/statusPageManager/statusPageManager'
import * as layoutActions from '../state/layout/actions'
import * as layoutSelectors from '../state/layout/selectors'
import {RootState} from '../state/types'
import * as viewsActions from '../state/views/actions'
import * as segmentTracker from '../store/middlewares/segmentTracker.js'
import {injectInterceptor} from '../utils/axios'
import {handleUsageBanner} from '../state/notifications/actions'
import {hasIntegrationOfTypes} from '../state/integrations/selectors'
import {IntegrationType} from '../models/integration/types'
import {Notification} from '../state/notifications/types'

import css from './App.less'
import BannerNotifications from './common/components/BannerNotifications/BannerNotifications'
import FullPage from './common/components/FullPage'
import KeyboardHelp from './common/components/KeyboardHelp/KeyboardHelp'
import ModalNotification from './common/components/ModalNotification'
import notificationsTheme from './common/components/Notifications'
import {ErrorBoundary} from './ErrorBoundary'
import PhoneIntegrationBar from './common/components/PhoneIntegrationBar/PhoneIntegrationBar'

type Props = {
    infobarOnMobile?: boolean
    isEditingWidgets?: boolean
    containerPadding?: boolean
    noContainerWidthLimit?: boolean
    children?: ReactNode
    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar: ComponentType<any>
    infobar?: ComponentType<any>
    content: ComponentType<any>
} & ConnectedProps<typeof connector> &
    RouteComponentProps

class App extends React.Component<Props> {
    componentDidMount() {
        this.props.injectInterceptor()

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
        segmentTracker.identifyUser(this.props.currentUser.toJS())
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
                                key={notification.id!}
                                {...notification}
                            />
                        ))}

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
                            filter={(n: Notification) => n.style === 'alert'}
                        />
                    </div>
                </ErrorBoundary>
            </DocumentTitle>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
        currentAccount: state.currentAccount,
        notifications: state.notifications,
        openedPanel: layoutSelectors.getCurrentOpenedPanel(state),
        hasPhoneIntegration: hasIntegrationOfTypes(IntegrationType.Phone)(
            state
        ),
    }),
    {
        injectInterceptor: injectInterceptor,
        fetchVisibleViewsCounts: viewsActions.fetchVisibleViewsCounts,
        openPanel: layoutActions.openPanel,
        closePanels: layoutActions.closePanels,
        gotoActiveView: viewsActions.gotoActiveView,
        handleUsageBanner: handleUsageBanner,
    }
)

export default connector(App)
