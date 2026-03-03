import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ShopifyCustomer, ShopifyCustomerProvider } from '@repo/customer'
import { logEvent, logEventWithSampling, SegmentEvent } from '@repo/logging'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import classNames from 'classnames'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { Navbar } from 'reactstrap'

import { Dot } from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'

import { AutoQA } from 'auto_qa'
import { TicketStatus } from 'business/types/ticket'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { useSearchParam } from 'hooks/useSearchParam'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useFindTopOpportunityByTicketId } from 'pages/aiAgent/opportunities/hooks/useFindTopOpportunitiyByTickteId'
import Infobar from 'pages/common/components/infobar/Infobar/Infobar'
import CustomerSyncForm from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/CustomerSyncForm'
import { channelToCommunicationIcon } from 'pages/common/components/infobar/Infobar/TicketTimelineWidget/channelToCommunicationIcon'
import { DATE_FEATURE_AVAILABLE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { isTrialMessageFromAIAgent } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import TicketFeedback from 'pages/tickets/detail/components/TicketFeedback'
import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import * as layoutSelectors from 'state/layout/selectors'
import { getAIAgentMessages, getTicket } from 'state/ticket/selectors'
import type { RootState } from 'state/types'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'
import * as actions from 'state/widgets/actions'
import {
    getSourcesWithCustomer,
    getWidgetsState,
} from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { TimelineContent } from 'tickets/ticket-timeline'
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

const SIDE_PANEL_VIEWED_EVENT_TYPE = 'summary'
const AI_AGENT_TAB_CLICK_EVENT_TYPE = 'tab_clicked'

export const TicketInfobarContainer = ({
    isEditingWidgets,
    isOnNewLayout,
    isOpenedPanel,
    sources,
    widgets,
}: Props) => {
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const params = useParams<{ ticketId: string }>()
    const [preferredTab, setPreferredTab] = useSearchParam('activeTab')
    const dispatch = useAppDispatch()
    const { notify: dispatchNotification } = useNotify()
    const accountId = useAppSelector(getCurrentAccountId)
    const currentUser = useAppSelector(getCurrentUser)
    const ticket = useAppSelector(getTicket)
    const { hasAccess } = useAiAgentAccess()
    const location = useLocation()
    const hasAIAgent = useHasAIAgent()
    const { activeTab, onChangeTab } = useTicketInfobarNavigation()
    const ticketId = parseInt(params.ticketId, 10)
    const { data: currentTicketData } = useGetTicket(ticketId!, undefined, {
        query: {
            enabled: ticketId !== undefined,
        },
    })
    const shopperId = currentTicketData?.data?.customer?.id

    const { data: feedback } = useGetFeedback({
        objectId: ticketId.toString(),
        objectType: 'TICKET',
    })

    const shopName =
        feedback?.executions?.[0]?.storeConfiguration?.shopName ?? ''
    const shopIntegrationId = useShopIntegrationId(shopName)

    const { topOpportunity } = useFindTopOpportunityByTicketId(
        shopIntegrationId ?? 0,
        ticketId ? ticketId.toString() : '',
    )

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
        if (hasUIVisionMS1) {
            return
        }

        if (ticket.id && tabCheckId.current !== ticket.id) {
            tabCheckId.current = ticket.id
            const nextTab =
                isTeamLead(currentUser) &&
                ticket.status === TicketStatus.Closed &&
                preferredTab === TicketInfobarTab.AIFeedback
                    ? TicketInfobarTab.AIFeedback
                    : TicketInfobarTab.Customer
            if (nextTab !== activeTab) {
                setPreferredTab(null)
                onChangeTab(nextTab)
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
        onChangeTab,
        hasUIVisionMS1,
    ])

    const customer = useMemo(
        () => sources.getIn(['ticket', 'customer']) || fromJS({}),
        [sources],
    )

    const [isCustomerSyncFormOpen, setIsCustomerSyncFormOpen] = useState(false)

    const handleSyncProfile = useCallback(() => {
        setIsCustomerSyncFormOpen(true)
    }, [])

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
        (tab: TicketInfobarTab) => {
            if (activeTab === tab) {
                return
            }

            onChangeTab(tab)

            if (tab === TicketInfobarTab.AIFeedback) {
                handleAIAgentTabClick()
                handleTicketMessage()
            }

            if (tab === TicketInfobarTab.AutoQA) {
                handleAutoQATabClick()
                handleTicketMessage()
            }

            if (
                tab === TicketInfobarTab.Customer ||
                tab === TicketInfobarTab.Shopify
            ) {
                resetTicketMessage()
            }
        },
        [
            activeTab,
            handleAIAgentTabClick,
            handleTicketMessage,
            resetTicketMessage,
            handleAutoQATabClick,
            onChangeTab,
        ],
    )

    const isEditWidgetPage = useMemo(
        () => location.pathname.includes('edit-widgets'),
        [location.pathname],
    )

    const tabs = useMemo(() => {
        return [
            {
                name: TicketInfobarTab.Customer,
                icon: CUSTOMER_DETAILS_TAB.ICON,
                label: CUSTOMER_DETAILS_TAB.LABEL,
            },
            ...(!isEditWidgetPage && hasAIAgent
                ? [
                      {
                          name: TicketInfobarTab.AIFeedback,
                          icon: AI_FEEDBACK_TAB.ICON,
                          label: AI_FEEDBACK_TAB.LABEL,
                          hasIndicator: !!topOpportunity,
                      },
                  ]
                : []),
            {
                name: TicketInfobarTab.AutoQA,
                icon: AUTO_QA_TAB.ICON,
                label: AUTO_QA_TAB.LABEL,
            },
        ]
    }, [hasAIAgent, isEditWidgetPage, topOpportunity])

    return (
        <div
            className={classNames('infobar-panel', css.container, {
                'hidden-panel': !isOpenedPanel,
            })}
        >
            {(hasAccess || hasAIAgent) && !hasUIVisionMS1 && (
                <Navbar className={css.navbar}>
                    {tabs.map((tab) => (
                        <div
                            key={tab.name}
                            className={classNames(css.link, {
                                [css.active]: activeTab === tab.name,
                            })}
                            onClick={() => handleChangeTab(tab.name)}
                        >
                            {tab.hasIndicator && <Dot color="purple" />}
                            <i className="icon material-icons">{tab.icon}</i>
                            {tab.label}
                        </div>
                    ))}
                </Navbar>
            )}

            {activeTab === TicketInfobarTab.Timeline && shopperId ? (
                <TimelineContent
                    shopperId={shopperId}
                    activeTicketId={params.ticketId}
                    channelToCommunicationIcon={channelToCommunicationIcon}
                />
            ) : activeTab === TicketInfobarTab.AIFeedback && hasAIAgent ? (
                <TicketFeedback key={ticket.id} />
            ) : activeTab === TicketInfobarTab.AutoQA ? (
                <div className={css.autoQaContainer}>
                    <AutoQA />
                </div>
            ) : activeTab === TicketInfobarTab.Shopify ? (
                <div className={css.shopifyContainer}>
                    <ShopifyCustomerProvider
                        dispatchNotification={dispatchNotification}
                    >
                        <ShopifyCustomer onSyncProfile={handleSyncProfile} />
                    </ShopifyCustomerProvider>
                    <CustomerSyncForm
                        isCustomerSyncFormOpen={isCustomerSyncFormOpen}
                        activeCustomer={customer}
                        setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                    />
                </div>
            ) : (
                <div
                    className={classNames(css.infoBarContainer, {
                        [css.infoBarContainerWithNavbar]:
                            !hasUIVisionMS1 && hasAccess,
                        [css.infobarHelpdeskV2MS1]: hasUIVisionMS1,
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
