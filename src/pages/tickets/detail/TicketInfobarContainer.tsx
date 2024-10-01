import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {useParams} from 'react-router-dom'
import classNames from 'classnames'
import {Navbar} from 'reactstrap'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
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
import TicketFeedback, {
    useHasAIAgent,
} from 'pages/tickets/detail/components/TicketFeedback'

import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {logEventWithSampling} from 'common/segment/segment'
import {SegmentEvent} from 'common/segment'
import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {DATE_FEATURE_AVAILABLE} from './components/AIAgentFeedbackBar/constants'

import css from './TicketInfobarContainer.less'

type OwnProps = {
    isEditingWidgets?: boolean
    isOnNewLayout?: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const CUSTOMER_INFORMATION_TAB = 'Customer Information'
export const TICKET_FEEDBACK_TAB = 'Ticket Feedback'

const SIDE_PANEL_VIEWED_EVENT_TYPE = 'summary'

export const TicketInfobarContainer = ({
    isEditingWidgets,
    isOnNewLayout,
    isOpenedPanel,
    sources,
    widgets,
}: Props) => {
    const params = useParams<{ticketId: string}>()
    const dispatch = useAppDispatch()
    const accountId = useAppSelector(getCurrentAccountId)

    const hasAIAgent = useHasAIAgent()
    const hasAutoQA = useFlag<boolean>(FeatureFlagKey.AutoQA, false)
    const hasTicketFeedback = hasAIAgent || hasAutoQA

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

    const aiMessages = useAppSelector(getAIAgentMessages).filter(
        (message) => new Date(message.created_datetime) > DATE_FEATURE_AVAILABLE
    )

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

    const handleAIAgentTabClick = () => {
        handleChangeTab(TicketAIAgentFeedbackTab.AIAgent)
        logEventWithSampling(SegmentEvent.AiAgentFeedbackTabClicked, {
            accountId,
        })
        logEventWithSampling(SegmentEvent.AiAgentFeedbackSidePanelViewed, {
            type: SIDE_PANEL_VIEWED_EVENT_TYPE,
            accountId,
        })
    }

    const activeTab = useAppSelector(getActiveTab)
    const showTicketFeedback = activeTab === TicketAIAgentFeedbackTab.AIAgent

    return (
        <div
            className={classNames('infobar-panel', css.container, {
                'hidden-panel': !isOpenedPanel,
            })}
        >
            {hasTicketFeedback && (
                <Navbar className={css.navbar}>
                    <div
                        className={classNames(css.link, {
                            [css.active]: !showTicketFeedback,
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
                        className={classNames(css.link, {
                            [css.active]: showTicketFeedback,
                        })}
                        onClick={handleAIAgentTabClick}
                    >
                        {TICKET_FEEDBACK_TAB}
                    </div>
                </Navbar>
            )}
            {hasTicketFeedback && showTicketFeedback ? (
                <TicketFeedback />
            ) : (
                <div
                    className={classNames(css.infoBarContainer, {
                        [css.infoBarContainerWithNavbar]: hasTicketFeedback,
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
