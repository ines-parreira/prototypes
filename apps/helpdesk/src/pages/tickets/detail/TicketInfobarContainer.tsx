import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCanAccessAIFeedback } from '@repo/ai-agent'
import type { EditShippingAddressModalRenderProps } from '@repo/customer'
import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { logEvent, logEventWithSampling, SegmentEvent } from '@repo/logging'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { InfobarEditModeHeader } from '@repo/tickets/infobar-edit-mode-header'
import classNames from 'classnames'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { Navbar } from 'reactstrap'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { useSearchParam } from 'hooks/useSearchParam'
import { useSyncWidgetEditSession } from 'hooks/useSyncWidgetEditSession'
import { DATE_FEATURE_AVAILABLE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { isTrialMessageFromAIAgent } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { useHasAIAgent } from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { executeAction } from 'state/infobar/actions'
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
import { DefaultExportEditOrderShippingAddressModal as ConnectedEditOrderShippingAddressModal } from 'Widgets/modules/Shopify/modules/Order/components/EditOrderShippingAddressModal'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import { useCreateOrder } from './hooks/useCreateOrder'
import { useCurrentUserBasicInfo } from './hooks/useCurrentUserBasicInfo'
import { TicketInfobarTabContent } from './TicketInfobarTabContent'
import { TimelineSidePanel } from './TimelineSidePanel'

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
    const hasUIVisionMS2 = useHelpdeskV2MS2Flag()
    const params = useParams<{ ticketId: string }>()
    const [preferredTab, setPreferredTab] = useSearchParam('activeTab')
    const dispatch = useAppDispatch()

    const accountId = useAppSelector(getCurrentAccountId)
    const { isStandaloneAiAgent } = useStandaloneAiAccess()
    const canAccessAIFeedback = useCanAccessAIFeedback()
    const ticket = useAppSelector(getTicket)
    const { hasAccess } = useAiAgentAccess()
    const location = useLocation()
    const hasAIAgent = useHasAIAgent()
    const {
        activeTab,
        editingWidgetType,
        onChangeTab,
        onSetEditingWidgetType,
    } = useTicketInfobarNavigation()
    const isEditMode = editingWidgetType != null
    const ticketId = parseInt(params.ticketId, 10)
    const { data: currentTicketData } = useGetTicket(ticketId!, undefined, {
        query: {
            enabled: ticketId !== undefined,
        },
    })
    const shopperId = currentTicketData?.data?.customer?.id

    useEffect(() => {
        dispatch(actions.selectContext())
        void dispatch(actions.fetchWidgets())
    }, [dispatch])

    const isWidgetEditSessionActive =
        widgets.getIn(['_internal', 'isEditing']) === true
    const isWidgetEditSessionRequested = Boolean(isEditingWidgets)

    useSyncWidgetEditSession({
        context: WidgetEnvironment.Ticket,
        isEditSessionActive: isWidgetEditSessionActive,
        isEditSessionRequested: isWidgetEditSessionRequested,
    })

    useEffect(() => {
        return () => {
            onChangeTab(TicketInfobarTab.Customer)
        }
    }, [onChangeTab])

    const tabCheckId = useRef<number>()

    useEffect(() => {
        if (ticket.id && tabCheckId.current !== ticket.id) {
            tabCheckId.current = ticket.id
            const nextTab =
                canAccessAIFeedback &&
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
        canAccessAIFeedback,
        dispatch,
        setPreferredTab,
        onChangeTab,
    ])

    const customer = useMemo(
        () => sources.getIn(['ticket', 'customer']) || fromJS({}),
        [sources],
    )

    const identifier = String(
        sources.getIn(['ticket', 'id'], params.ticketId || ''),
    )

    const currentUserBasicInfo = useCurrentUserBasicInfo()

    const [isCustomerSyncFormOpen, setIsCustomerSyncFormOpen] = useState(false)

    const handleSyncProfile = useCallback(() => {
        setIsCustomerSyncFormOpen(true)
    }, [])

    const createOrder = useCreateOrder()
    const editModalParamsRef = useRef<Record<string, unknown>>({})

    const renderEditShippingAddressModal = useCallback(
        ({
            isOpen,
            orderId,
            customerId,
            integrationId,
            currentShippingAddress,
            onClose,
            onSuccess,
        }: EditShippingAddressModalRenderProps) => (
            <IntegrationContext.Provider
                value={{
                    integrationId: integrationId ?? null,
                    integration: fromJS({}),
                }}
            >
                <ConnectedEditOrderShippingAddressModal
                    isOpen={isOpen}
                    onClose={onClose}
                    modalClassName={css.aboveSidePanel}
                    onChange={(name, value) => {
                        editModalParamsRef.current[name] = value
                    }}
                    onBulkChange={(values, callback) => {
                        values.forEach(({ name, value }) => {
                            editModalParamsRef.current[name] = value
                        })
                        callback?.()
                    }}
                    onSubmit={() => {
                        const addressPayload = editModalParamsRef.current
                            .payload as Record<string, unknown>
                        dispatch(
                            executeAction({
                                actionName:
                                    ShopifyActionType.EditShippingAddress,
                                integrationId: integrationId ?? null,
                                payload: editModalParamsRef.current,
                            }),
                        )
                        onClose()
                        onSuccess(addressPayload)
                    }}
                    data={{
                        actionName: ShopifyActionType.EditShippingAddress,
                        order_id: orderId,
                        customer_id: customerId,
                        current_shipping_address: fromJS(
                            currentShippingAddress,
                        ),
                    }}
                    title="Edit Shipping Address"
                />
            </IntegrationContext.Provider>
        ),
        [dispatch],
    )
    const aiMessages = useAppSelector(getAIAgentMessages).filter(
        (message) =>
            new Date(message.created_datetime) > DATE_FEATURE_AVAILABLE,
    )

    const handleCloseEditMode = useCallback(() => {
        dispatch(actions.startEditionMode(WidgetEnvironment.Ticket))
        onSetEditingWidgetType(null)
    }, [dispatch, onSetEditingWidgetType])

    const handleAIAgentTabClick = useCallback(() => {
        logEventWithSampling(SegmentEvent.AiAgentFeedbackTabClicked, {
            accountId,
        })
        logEventWithSampling(SegmentEvent.AiAgentFeedbackSidePanelViewed, {
            type: SIDE_PANEL_VIEWED_EVENT_TYPE,
            accountId,
        })
    }, [accountId])

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
                tab === TicketInfobarTab.Shopify ||
                tab === TicketInfobarTab.Recharge ||
                tab === TicketInfobarTab.BigCommerce ||
                tab === TicketInfobarTab.Magento ||
                tab === TicketInfobarTab.WooCommerce ||
                tab === TicketInfobarTab.Smile ||
                tab === TicketInfobarTab.Yotpo ||
                tab === TicketInfobarTab.CustomIntegrations
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
        const aiFeedbackTabs =
            !isEditWidgetPage && hasAIAgent && canAccessAIFeedback
                ? [
                      {
                          name: TicketInfobarTab.AIFeedback,
                          icon: AI_FEEDBACK_TAB.ICON,
                          label: AI_FEEDBACK_TAB.LABEL,
                      },
                  ]
                : []

        if (isStandaloneAiAgent) {
            return [
                ...aiFeedbackTabs,
                {
                    name: TicketInfobarTab.Customer,
                    icon: CUSTOMER_DETAILS_TAB.ICON,
                    label: CUSTOMER_DETAILS_TAB.LABEL,
                },
                {
                    name: TicketInfobarTab.AutoQA,
                    icon: AUTO_QA_TAB.ICON,
                    label: AUTO_QA_TAB.LABEL,
                },
            ]
        }

        return [
            {
                name: TicketInfobarTab.Customer,
                icon: CUSTOMER_DETAILS_TAB.ICON,
                label: CUSTOMER_DETAILS_TAB.LABEL,
            },
            ...aiFeedbackTabs,
            {
                name: TicketInfobarTab.AutoQA,
                icon: AUTO_QA_TAB.ICON,
                label: AUTO_QA_TAB.LABEL,
            },
        ]
    }, [canAccessAIFeedback, hasAIAgent, isEditWidgetPage, isStandaloneAiAgent])

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
                            <i className="icon material-icons">{tab.icon}</i>
                            {tab.label}
                        </div>
                    ))}
                </Navbar>
            )}

            {hasUIVisionMS2 && isEditMode && editingWidgetType && (
                <InfobarEditModeHeader
                    editingWidgetType={editingWidgetType}
                    onClose={handleCloseEditMode}
                />
            )}

            <TicketInfobarTabContent
                activeTab={activeTab}
                hasAIAgent={hasAIAgent}
                canAccessAIFeedback={canAccessAIFeedback}
                feedbackKey={ticket.id}
                customerSectionsProps={{
                    sources,
                    widgets,
                    customer,
                    identifier,
                    isEditingWidgets: !!isEditingWidgets,
                    isOnNewLayout,
                    customerId: ticket.customer?.id ?? null,
                    ticketId,
                    currentUser: currentUserBasicInfo,
                    createOrder,
                    handleSyncProfile,
                    renderEditShippingAddressModal,
                    isCustomerSyncFormOpen,
                    setIsCustomerSyncFormOpen,
                }}
            />

            {shopperId !== undefined && (
                <TimelineSidePanel
                    isOpen={activeTab === TicketInfobarTab.Timeline}
                    onClose={() => onChangeTab(TicketInfobarTab.Customer)}
                    shopperId={shopperId}
                    activeTicketId={params.ticketId}
                />
            )}
        </div>
    )
}

const connector = connect((state: RootState) => ({
    widgets: getWidgetsState(state),
    sources: getSourcesWithCustomer(state),
    isOpenedPanel: layoutSelectors.isOpenedPanel('infobar')(state),
}))

const DefaultExportTicketInfobarContainer = connector(TicketInfobarContainer)

export { DefaultExportTicketInfobarContainer }
