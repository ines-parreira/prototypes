import { useCallback, useEffect, useMemo, useRef } from 'react'

import classNames from 'classnames'
import { fromJS } from 'immutable'
import { connect, ConnectedProps } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { Navbar } from 'reactstrap'

import { AutoQA } from 'auto_qa'
import { TicketStatus } from 'business/types/ticket'
import { SegmentEvent } from 'common/segment'
import { logEvent, logEventWithSampling } from 'common/segment/segment'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSearchParam } from 'hooks/useSearchParam'
import Infobar from 'pages/common/components/infobar/Infobar/Infobar'
import { DATE_FEATURE_AVAILABLE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { isTrialMessageFromAIAgent } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import TicketFeedback from 'pages/tickets/detail/components/TicketFeedback'
import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import * as layoutSelectors from 'state/layout/selectors'
import { getAIAgentMessages, getTicket } from 'state/ticket/selectors'
import { RootState } from 'state/types'
import {
    changeActiveTab,
    changeTicketMessage,
    getActiveTab,
} from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import * as actions from 'state/widgets/actions'
import {
    getSourcesWithCustomer,
    getWidgetsState,
} from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { isTeamLead } from 'utils'

import { useFeedbackTracking } from './components/AIAgentFeedbackBar/hooks/useFeedbackTracking'

import css from './TicketInfobarContainer.less'

type OwnProps = {
    isEditingWidgets?: boolean
    isOnNewLayout?: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const CUSTOMER_DETAILS_TAB = {
    LABEL: 'Customer',
    ICON: 'person',
}
export const AI_FEEDBACK_TAB = { LABEL: 'AI Feedback', ICON: 'auto_awesome' }
export const AUTO_QA_TAB = { LABEL: 'Auto QA', ICON: 'star' }
export const CUSTOMER_DETAILS_TAB_OLD_LABEL = 'Customer Details'
export const AI_FEEDBACK_TAB_OLD_LABEL = '✨ AI Feedback'

const SIDE_PANEL_VIEWED_EVENT_TYPE = 'summary'
const AI_AGENT_TAB_CLICK_EVENT_TYPE = 'tab_clicked'

export const TicketInfobarContainer = ({
    isEditingWidgets,
    isOnNewLayout,
    isOpenedPanel,
    sources,
    widgets,
}: Props) => {
    const params = useParams<{ ticketId: string }>()
    const [preferredTab, setPreferredTab] = useSearchParam('activeTab')
    const dispatch = useAppDispatch()
    const accountId = useAppSelector(getCurrentAccountId)
    const currentUser = useAppSelector(getCurrentUser)
    const ticket = useAppSelector(getTicket)
    const activeTab = useAppSelector(getActiveTab)
    const hasAutomate = useAppSelector(getHasAutomate)
    const location = useLocation()
    const hasAIAgent = useHasAIAgent()
    const isAfterFeedbackCollectionPeriod =
        useTicketIsAfterFeedbackCollectionPeriod()
    const isSimplifiedFeedbackCollectionEnabled =
        useFlag(FeatureFlagKey.SimplifyAiAgentFeedbackCollection) &&
        isAfterFeedbackCollectionPeriod

    const { onFeedbackTabOpened } = useFeedbackTracking({
        ticketId: ticket.id,
        accountId,
        userId: currentUser.get('id'),
    })

    useEffect(() => {
        dispatch(actions.selectContext())
        void dispatch(actions.fetchWidgets())
    }, [dispatch])

    const tabCheckId = useRef<number>()

    useEffect(() => {
        if (ticket.id && tabCheckId.current !== ticket.id) {
            tabCheckId.current = ticket.id
            const nextTab =
                isTeamLead(currentUser) &&
                ticket.status === TicketStatus.Closed &&
                preferredTab === TicketAIAgentFeedbackTab.AIAgent
                    ? TicketAIAgentFeedbackTab.AIAgent
                    : TicketAIAgentFeedbackTab.CustomerInformation
            if (nextTab !== activeTab) {
                setPreferredTab(null)
                dispatch(changeActiveTab({ activeTab: nextTab }))
            }
            dispatch(changeTicketMessage({ message: undefined }))
        }
    }, [
        ticket.status,
        ticket.id,
        activeTab,
        preferredTab,
        currentUser,
        dispatch,
        setPreferredTab,
    ])

    const customer = useMemo(
        () => sources.getIn(['ticket', 'customer']) || fromJS({}),
        [sources],
    )

    const aiMessages = useAppSelector(getAIAgentMessages).filter(
        (message) =>
            new Date(message.created_datetime) > DATE_FEATURE_AVAILABLE,
    )

    const handleAIAgentTabClick = useCallback(() => {
        onFeedbackTabOpened('tab-clicked')
        logEventWithSampling(SegmentEvent.AiAgentFeedbackTabClicked, {
            accountId,
        })
        logEventWithSampling(SegmentEvent.AiAgentFeedbackSidePanelViewed, {
            type: SIDE_PANEL_VIEWED_EVENT_TYPE,
            accountId,
        })
    }, [accountId, onFeedbackTabOpened])

    const handleAutoQATabClick = useCallback(() => {
        logEventWithSampling(SegmentEvent.AutoQATabClicked, {
            accountId,
        })
        logEvent(SegmentEvent.AutoQATicketInteraction, {
            ticket_id: params.ticketId,
            type: AI_AGENT_TAB_CLICK_EVENT_TYPE,
        })
        logEventWithSampling(SegmentEvent.AutoQASidePanelViewed, {
            type: SIDE_PANEL_VIEWED_EVENT_TYPE,
            accountId,
        })
    }, [params.ticketId, accountId])

    const handleTicketMessage = useCallback(() => {
        let message
        if (aiMessages.length === 1) {
            if (
                aiMessages[0].public ||
                isTrialMessageFromAIAgent(aiMessages[0])
            ) {
                message = aiMessages[0]
            }
        }

        dispatch(changeTicketMessage({ message }))
    }, [aiMessages, dispatch])

    const resetTicketMessage = useCallback(() => {
        dispatch(changeTicketMessage({ message: undefined }))
    }, [dispatch])

    const handleChangeTab = useCallback(
        (tab: TicketAIAgentFeedbackTab) => {
            if (activeTab === tab) {
                return
            }

            dispatch(changeActiveTab({ activeTab: tab }))

            if (tab === TicketAIAgentFeedbackTab.AIAgent) {
                handleAIAgentTabClick()
                handleTicketMessage()
            }

            if (tab === TicketAIAgentFeedbackTab.AutoQA) {
                handleAutoQATabClick()
                handleTicketMessage()
            }

            if (tab === TicketAIAgentFeedbackTab.CustomerInformation) {
                resetTicketMessage()
            }
        },
        [
            activeTab,
            dispatch,
            handleAIAgentTabClick,
            handleTicketMessage,
            resetTicketMessage,
            handleAutoQATabClick,
        ],
    )

    const isAIAgentTabSelected = useMemo(
        () => activeTab === TicketAIAgentFeedbackTab.AIAgent,
        [activeTab],
    )
    const showAIAgentContent = useMemo(
        () =>
            isAIAgentTabSelected &&
            (isSimplifiedFeedbackCollectionEnabled ? hasAIAgent : true),
        [
            isAIAgentTabSelected,
            hasAIAgent,
            isSimplifiedFeedbackCollectionEnabled,
        ],
    )

    const isAutoQATabSelected = useMemo(
        () => activeTab === TicketAIAgentFeedbackTab.AutoQA,
        [activeTab],
    )
    const showAutoQATabContent = useMemo(
        () => isAutoQATabSelected && isSimplifiedFeedbackCollectionEnabled,
        [isSimplifiedFeedbackCollectionEnabled, isAutoQATabSelected],
    )

    const isCustomerInfoTabSelected = useMemo(
        () => activeTab === TicketAIAgentFeedbackTab.CustomerInformation,
        [activeTab],
    )
    const showCustomerInfoTabContent = useMemo(
        () => isCustomerInfoTabSelected,
        [isCustomerInfoTabSelected],
    )

    const isEditWidgetPage = useMemo(
        () => location.pathname.includes('edit-widgets'),
        [location.pathname],
    )

    return (
        <div
            className={classNames('infobar-panel', css.container, {
                'hidden-panel': !isOpenedPanel,
            })}
        >
            {hasAutomate && (
                <Navbar
                    className={classNames(css.navbar, {
                        [css.noPadding]: isSimplifiedFeedbackCollectionEnabled,
                    })}
                >
                    <div
                        className={classNames(css.link, {
                            [css.active]: isCustomerInfoTabSelected,
                            [css.withoutSpaceBetween]:
                                isSimplifiedFeedbackCollectionEnabled,
                        })}
                        onClick={() =>
                            handleChangeTab(
                                TicketAIAgentFeedbackTab.CustomerInformation,
                            )
                        }
                    >
                        {isSimplifiedFeedbackCollectionEnabled && (
                            <i className="icon material-icons">
                                {CUSTOMER_DETAILS_TAB.ICON}
                            </i>
                        )}
                        {isSimplifiedFeedbackCollectionEnabled
                            ? CUSTOMER_DETAILS_TAB.LABEL
                            : CUSTOMER_DETAILS_TAB_OLD_LABEL}
                    </div>
                    {!isEditWidgetPage &&
                        (isSimplifiedFeedbackCollectionEnabled
                            ? hasAIAgent
                            : true) && (
                            <div
                                className={classNames(css.link, {
                                    [css.active]: isAIAgentTabSelected,
                                    [css.withoutSpaceBetween]:
                                        isSimplifiedFeedbackCollectionEnabled,
                                })}
                                onClick={() =>
                                    handleChangeTab(
                                        TicketAIAgentFeedbackTab.AIAgent,
                                    )
                                }
                            >
                                {isSimplifiedFeedbackCollectionEnabled && (
                                    <i className="icon material-icons md-1">
                                        {AI_FEEDBACK_TAB.ICON}
                                    </i>
                                )}
                                {isSimplifiedFeedbackCollectionEnabled
                                    ? AI_FEEDBACK_TAB.LABEL
                                    : AI_FEEDBACK_TAB_OLD_LABEL}
                            </div>
                        )}
                    {!isEditWidgetPage &&
                        isSimplifiedFeedbackCollectionEnabled && (
                            <div
                                className={classNames(css.link, {
                                    [css.active]: isAutoQATabSelected,
                                    [css.withoutSpaceBetween]:
                                        isSimplifiedFeedbackCollectionEnabled,
                                })}
                                onClick={() =>
                                    handleChangeTab(
                                        TicketAIAgentFeedbackTab.AutoQA,
                                    )
                                }
                            >
                                <i className="icon material-icons">
                                    {AUTO_QA_TAB.ICON}
                                </i>
                                {AUTO_QA_TAB.LABEL}
                            </div>
                        )}
                </Navbar>
            )}

            {showAIAgentContent && <TicketFeedback key={ticket.id} />}

            {showAutoQATabContent && (
                <div className={css.autoQaContainer}>
                    <AutoQA />
                </div>
            )}

            {showCustomerInfoTabContent && (
                <div
                    className={classNames(css.infoBarContainer, {
                        [css.infoBarContainerWithNavbar]: hasAutomate,
                    })}
                >
                    <Infobar
                        sources={sources}
                        isRouteEditingWidgets={!!isEditingWidgets}
                        identifier={(
                            sources.getIn(
                                ['ticket', 'id'],
                                params.ticketId || '',
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
