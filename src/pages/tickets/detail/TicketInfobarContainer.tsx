import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classNames from 'classnames'
import {Navbar} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    changeActiveTab,
    changeTicketMessage,
    getActiveTab,
} from 'state/ui/ticketAIAgentFeedback'
import * as layoutSelectors from 'state/layout/selectors'
import {RootState} from 'state/types'
import * as actions from 'state/widgets/actions'
import {getAIAgentMessages} from 'state/ticket/selectors'
import {WidgetEnvironment} from 'state/widgets/types'
import {getSourcesWithCustomer, getWidgetsState} from 'state/widgets/selectors'
import Infobar from 'pages/common/components/infobar/Infobar/Infobar'
import AIAgentFeedbackBar from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentFeedbackBar'

import secondaryNavbarCSS from 'pages/common/components/SecondaryNavbar/SecondaryNavbar.less'
import css from 'pages/tickets/detail/TicketInforbarContainer.less'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'

type OwnProps = {
    isEditingWidgets?: boolean
    isOnNewLayout?: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const CUSTOMER_INFORMATION_TAB = 'Customer Information'
export const AI_AGENT_TAB = 'AI Agent'

export const TicketInfobarContainer = ({
    isEditingWidgets,
    isOnNewLayout,
    isOpenedPanel,
    sources,
    widgets,
}: Props) => {
    const params = useParams<{ticketId: string}>()
    const dispatch = useAppDispatch()
    const isFeedbackToAiAgentEnabled =
        useFlags()[FeatureFlagKey.FeedbackToAIAgentInTicketViews]

    useEffect(() => {
        dispatch(actions.selectContext())
        void dispatch(actions.fetchWidgets())
    }, [dispatch])

    useEffect(() => {
        return () => {
            dispatch(
                changeActiveTab({
                    activeTab: TicketAIAgentFeedbackTab.CustomerInformation,
                })
            )
            dispatch(changeTicketMessage({message: undefined}))
        }
    }, [dispatch, params.ticketId])

    const customer =
        sources.getIn(['ticket', 'customer']) || (fromJS({}) as Map<any, any>)

    const aiMessages = useAppSelector(getAIAgentMessages)

    const handleChangeTab = (tab: TicketAIAgentFeedbackTab) => {
        if (activeTab === tab) {
            return
        }

        dispatch(changeActiveTab({activeTab: tab}))

        if (tab === TicketAIAgentFeedbackTab.AIAgent) {
            dispatch(
                changeTicketMessage({
                    message:
                        aiMessages.length === 1 && aiMessages[0].public
                            ? aiMessages[0]
                            : undefined,
                })
            )
        } else {
            dispatch(changeTicketMessage({message: undefined}))
        }
    }

    const showNavbar = aiMessages.length > 0 && isFeedbackToAiAgentEnabled

    const activeTab = useAppSelector(getActiveTab)
    const isAIAgentTabActive = activeTab === TicketAIAgentFeedbackTab.AIAgent

    return (
        <div
            className={classNames('infobar-panel', css.container, {
                'hidden-panel': !isOpenedPanel,
            })}
        >
            {showNavbar && (
                <Navbar className={secondaryNavbarCSS.navbar}>
                    <div
                        className={classNames(secondaryNavbarCSS.link, {
                            [secondaryNavbarCSS.active]: !isAIAgentTabActive,
                        })}
                        onClick={() =>
                            handleChangeTab(
                                TicketAIAgentFeedbackTab.CustomerInformation
                            )
                        }
                    >
                        {CUSTOMER_INFORMATION_TAB}
                    </div>
                    <div
                        className={classNames(secondaryNavbarCSS.link, {
                            [secondaryNavbarCSS.active]: isAIAgentTabActive,
                        })}
                        onClick={() =>
                            handleChangeTab(TicketAIAgentFeedbackTab.AIAgent)
                        }
                    >
                        <i
                            className={classNames(
                                css.autoAwesomeIcon,
                                'material-icons'
                            )}
                        >
                            auto_awesome
                        </i>{' '}
                        {AI_AGENT_TAB}
                    </div>
                </Navbar>
            )}
            {isAIAgentTabActive ? (
                <AIAgentFeedbackBar />
            ) : (
                <div
                    className={classNames(css.infoBarContainer, {
                        [css.infoBarContainerWithNavbar]: showNavbar,
                    })}
                >
                    <Infobar
                        sources={sources}
                        isRouteEditingWidgets={!!isEditingWidgets}
                        identifier={(
                            sources.getIn(
                                ['ticket', 'id'],
                                params.ticketId || ''
                            ) as number
                        ).toString()}
                        customer={customer}
                        widgets={widgets}
                        context={WidgetEnvironment.Ticket}
                        isOnNewLayout={isOnNewLayout}
                    />
                </div>
            )}
        </div>
    )
}

const connector = connect((state: RootState) => ({
    widgets: getWidgetsState(state),
    sources: getSourcesWithCustomer(state),
    isOpenedPanel: layoutSelectors.isOpenedPanel('infobar')(state),
}))

export default connector(TicketInfobarContainer)
