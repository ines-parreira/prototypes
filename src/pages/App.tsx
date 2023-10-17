import classnames from 'classnames'
import React, {
    ComponentType,
    ReactNode,
    memo,
    useLayoutEffect,
    useRef,
} from 'react'
import {Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'
import {Map} from 'immutable'
import {Program} from 'estree'

import 'assets/css/main.less'
import {useEffectOnce} from 'react-use'
import pollingManager from 'services/pollingManager'
import userActivityManager from 'services/userActivityManager'
import {closePanels, openPanel} from 'state/layout/actions'
import {getCurrentOpenedPanel} from 'state/layout/selectors'
import {fetchVisibleViewsCounts} from 'state/views/actions'
import {identifyUser} from 'store/middlewares/segmentTracker'
import {handleUsageBanner} from 'state/notifications/actions'
import {hasIntegrationOfTypes} from 'state/integrations/selectors'
import {
    getActiveView,
    shouldFetchActiveViewTickets as shouldFetchActiveViewTicketsSelect,
} from 'state/views/selectors'
import {IntegrationType} from 'models/integration/types'
import {getViewFilters} from 'state/views/utils'
import {CollectionOperator, EqualityOperator} from 'state/rules/types'
import {handle2FAEnforced} from 'state/currentUser/actions'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import css from './App.less'
import FullPage from './common/components/FullPage'
import {ErrorBoundary} from './ErrorBoundary'
import PhoneIntegrationBar from './common/components/PhoneIntegrationBar/PhoneIntegrationBar'
import IconButton from './common/components/button/IconButton'
import Button from './common/components/button/Button'
import Spotlight from './common/components/Spotlight/Spotlight'

type Props = {
    infobarOnMobile?: boolean
    isEditingWidgets?: boolean
    containerPadding?: boolean
    noContainerWidthLimit?: boolean
    children?: ReactNode
    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar?: ComponentType<any>
    infobar?: ComponentType<any>
    content?: ComponentType<any>
}

const App = ({
    infobarOnMobile,
    isEditingWidgets,
    noContainerWidthLimit,
    containerPadding,
    content: Content,
    navbar: Navbar,
    infobar: Infobar,
    children,
}: Props) => {
    const dispatch = useAppDispatch()

    const currentUser = useAppSelector((state) => state.currentUser)

    const isCurrentUserActive = currentUser.get('is_active')
    const isPreviousCurrentUserActive = useRef()

    const currentAccount = useAppSelector((state) => state.currentAccount)
    const openedPanel = useAppSelector(getCurrentOpenedPanel)
    const hasPhoneIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.Phone)
    )
    const activeView = useAppSelector(getActiveView)
    const shouldFetchActiveViewTickets = useAppSelector(
        shouldFetchActiveViewTicketsSelect
    )

    useEffectOnce(() => {
        const newAccountStatus = currentAccount.getIn(['status', 'status'])
        const notification: Map<any, any> | undefined = currentAccount.getIn([
            'status',
            'notification',
        ])

        dispatch(
            handleUsageBanner({
                newAccountStatus,
                notification: notification ? notification.toJS() : null,
                currentAccountStatus: newAccountStatus,
            })
        )

        userActivityManager.watch()

        // ask for the newest view counts
        dispatch(fetchVisibleViewsCounts())

        identifyUser(currentUser.toJS())

        dispatch(handle2FAEnforced())

        return () => {
            pollingManager.stop()
        }
    })

    useLayoutEffect(() => {
        if (isPreviousCurrentUserActive.current && !isCurrentUserActive) {
            if (activeView.get('filters_ast')) {
                if (shouldFetchActiveViewTickets) {
                    const filtersAST = (
                        activeView.get('filters_ast') as Map<any, any>
                    ).toJS() as Program

                    const viewFilters = getViewFilters(filtersAST)

                    const isChatView = viewFilters.some(
                        (filter) =>
                            filter.left === 'ticket.channel' &&
                            (filter.operator === EqualityOperator.Eq ||
                                CollectionOperator.ContainsAny) &&
                            (filter.right as string | undefined)?.includes(
                                'chat'
                            )
                    )

                    if (isChatView) {
                        pollingManager.stopRecentViewCountsInterval()
                        return
                    }
                }
            }

            // Stop polling when current user becomes inactive
            pollingManager.stop()
        } else if (
            !isPreviousCurrentUserActive.current &&
            isCurrentUserActive
        ) {
            // Start polling when current user becomes active
            pollingManager.start()
        }
        return () => {
            isPreviousCurrentUserActive.current = isCurrentUserActive
        }
    }, [activeView, isCurrentUserActive, shouldFetchActiveViewTickets])

    const Wrapper = containerPadding ? FullPage : Container
    const wrapperProps = containerPadding
        ? {noContainerWidthLimit}
        : {fluid: true, className: classnames(css['main-content'])}
    const content = !!Content ? <Content /> : children

    const hasOpenedPanel = !!openedPanel

    return (
        <div id="app-root" className={css.app}>
            <Spotlight>{Navbar && <Navbar />}</Spotlight>

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
                    <div className={classnames('app-content', css.content)}>
                        <div className="mobile-nav">
                            <IconButton
                                className="mr-3"
                                fillStyle="ghost"
                                intent="secondary"
                                onClick={() => dispatch(openPanel('navbar'))}
                            >
                                menu
                            </IconButton>
                            {infobarOnMobile && (
                                <Button
                                    className="ml-3"
                                    fillStyle="ghost"
                                    intent="secondary"
                                    onClick={() =>
                                        dispatch(openPanel('infobar'))
                                    }
                                >
                                    More info
                                </Button>
                            )}
                        </div>

                        <Wrapper {...wrapperProps}>
                            <ErrorBoundary>{content || null}</ErrorBoundary>
                        </Wrapper>
                    </div>

                    {!!Infobar && (
                        <Infobar isEditingWidgets={!!isEditingWidgets} />
                    )}
                </div>
                {hasPhoneIntegration && <PhoneIntegrationBar />}
            </div>

            <div
                className={classnames(css.backdrop, {
                    [css.hidden]: !hasOpenedPanel,
                })}
                onClick={() => dispatch(closePanels())}
            />
        </div>
    )
}

export default memo(App, _isEqual)
