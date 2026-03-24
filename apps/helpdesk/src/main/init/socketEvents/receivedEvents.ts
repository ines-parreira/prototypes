import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import * as Sentry from '@sentry/react'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { cloneDeep } from 'lodash'
import _find from 'lodash/find'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { shouldTicketBeDisplayedInRecentChats } from 'business/recentChats'
import { store as reduxStore } from 'common/store'
import { isSpecificTicketPath } from 'common/utils'
import { MAX_RECENT_CHATS } from 'config/recentChats'
import { isMigrationInProgress } from 'hooks/useWhatsAppMigration'
import { throttledUpdateCustomFieldsCache } from 'main/init/socketEvents/helpers'
import { fetchNewPhoneNumbers } from 'models/phoneNumber/resources'
import type { UseListVoiceCalls } from 'models/voiceCall/queries'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import { isVoiceCall } from 'models/voiceCall/types'
import { throttledUpdateCustomerCache } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers'
import { ActivityEvents, logActivityEvent } from 'services/activityTracker'
import type { SocketManager } from 'services/socketManager/socketManager'
import type {
    AccountUpdatedEvent,
    ActionExecutedEvent,
    AgentAvailabilityUpdatedEvent,
    CustomerExternalDataUpdatedEvent,
    CustomerUpdatedEvent,
    EmailIntegrationVerifiedEvent,
    FacebookIntegrationsReconnected,
    MacroParamsUpdatedEvent,
    OrderEvent,
    OutboundPhoneCallInitiated,
    ReceivedEvent,
    ShopperAddressEvent,
    ShopperEvent,
    TicketChatUpdatedEvent,
    TicketMessageActionFailedEvent,
    TicketMessageChatCreatedEvent,
    TicketMessageCreatedEvent,
    TicketMessageFailedEvent,
    TicketTypingActivityShopperStartedEvent,
    TicketUpdatedEvent,
    ViewCountUpdatedEvent,
    ViewCreatedEvent,
    ViewDeactivated,
    ViewDeletedEvent,
    ViewSectionCreatedEvent,
    ViewSectionDeletedEvent,
    ViewSectionUpdatedEvent,
    ViewUpdatedEvent,
    VoiceCallCreatedEvent,
    VoiceCallRecordingUpdatedEvent,
    VoiceCallUpdatedEvent,
    WhatsAppOnboardingFailedEvent,
    WhatsAppOnboardingSucceededEvent,
} from 'services/socketManager/types'
import { SocketEventType } from 'services/socketManager/types'
import * as currentBillingSelectors from 'state/billing/selectors'
import * as chatsActions from 'state/chats/actions'
import * as currentAccountConstants from 'state/currentAccount/constants'
import * as currentAccountSelectors from 'state/currentAccount/selectors'
import { setIsAvailable } from 'state/currentUser/actions'
import * as currentUserSelectors from 'state/currentUser/selectors'
import { newPhoneNumbersFetched } from 'state/entities/phoneNumbers/actions'
import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
} from 'state/entities/sections/actions'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from 'state/entities/views/actions'
import { viewsCountFetched } from 'state/entities/viewsCount/actions'
import * as infobarActions from 'state/infobar/actions'
import * as integrationsActions from 'state/integrations/actions'
import { getEmailMigrations } from 'state/integrations/selectors'
import { MACRO_PARAMS_UPDATED } from 'state/macro/constants'
import * as notificationsActions from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getTeams } from 'state/teams/selectors'
import * as ticketActions from 'state/ticket/actions'
import type { RootState } from 'state/types'
import * as viewsActions from 'state/views/actions'
import * as viewsConstants from 'state/views/constants'
import { isViewSharedWithUser } from 'state/views/utils'
import { isCurrentlyOnTicket } from 'utils'

/**
 * Events that can be received from server via socket
 */
const receivedEvents: ReceivedEvent[] = [
    {
        name: 'customer-updated',
        onReceive: function (json) {
            reduxStore.dispatch(
                ticketActions.mergeCustomer(
                    (json as CustomerUpdatedEvent).customer,
                ),
            )
            const customerId = (json as CustomerUpdatedEvent)?.customer?.id

            if (customerId) {
                throttledUpdateCustomerCache(customerId as number)

                window.dispatchEvent(
                    new CustomEvent('customer-updated', {
                        detail: { customerId },
                    }),
                )
            }
        },
    },
    {
        name: SocketEventType.CustomerExternalDataUpdated,
        onReceive: function (json) {
            const customerExternalDataUpdatedEvent =
                json as CustomerExternalDataUpdatedEvent
            reduxStore.dispatch(
                ticketActions.mergeCustomerExternalData(
                    customerExternalDataUpdatedEvent.customer_id,
                    customerExternalDataUpdatedEvent.external_data,
                ),
            )
        },
    },
    {
        name: 'ticket-updated',
        onReceive: function (json) {
            const { ticket } = json as TicketUpdatedEvent

            appQueryClient.invalidateQueries({
                queryKey: queryKeys.tickets.getTicket(ticket.id),
            })

            if (ticket.is_unread) {
                reduxStore.dispatch(chatsActions.markChatAsUnread(ticket.id))
            }

            reduxStore.dispatch(ticketActions.mergeTicket(ticket) as any)

            const customerId = ticket?.customer?.id
            if (customerId) {
                throttledUpdateCustomerCache(customerId)
            }
            throttledUpdateCustomFieldsCache({
                customerId,
                ticketId: ticket.id,
            })
        },
    },
    {
        name: 'ticket-message-created',
        onReceive: function (json) {
            const ticket = (json as TicketMessageCreatedEvent).ticket

            if (isCurrentlyOnTicket(ticket.id)) {
                ;(this as unknown as SocketManager).send(
                    SocketEventType.TicketViewed,
                    ticket.id as unknown as string,
                )
            }

            reduxStore.dispatch(ticketActions.mergeTicket(ticket) as any)
            const customerId = ticket?.customer?.id
            if (customerId) {
                throttledUpdateCustomerCache(customerId)
            }
        },
    },
    {
        name: 'ticket-message-action-failed',
        onReceive: function (json) {
            void appQueryClient.invalidateQueries({
                queryKey: queryKeys.customFields.all(),
            })
            reduxStore.dispatch(
                ticketActions.handleMessageActionError(
                    (json as TicketMessageActionFailedEvent)
                        .ticket_id as unknown as string,
                ) as any,
            )
        },
    },
    {
        name: 'ticket-message-failed',
        onReceive: function (json) {
            logEvent(SegmentEvent.TicketMessageFailed, { data: json })
            reduxStore.dispatch(
                ticketActions.handleMessageError(
                    json as TicketMessageFailedEvent,
                ) as any,
            )
        },
    },
    {
        name: 'action-executed',
        onReceive: function (json) {
            reduxStore.dispatch(
                infobarActions.handleExecutedAction(
                    json as ActionExecutedEvent,
                ) as any,
            )
        },
    },
    {
        name: 'view-created',
        onReceive: function (json) {
            reduxStore.dispatch({
                type: viewsConstants.CREATE_VIEW_SUCCESS,
                resp: (json as ViewCreatedEvent).view,
            })
            Sentry.addBreadcrumb({
                message: 'View created from socket event',
                data: json,
                level: 'log',
            })
            reduxStore.dispatch(viewCreated((json as ViewCreatedEvent).view))
        },
    },
    {
        name: 'view-updated',
        onReceive: function (json) {
            const state = reduxStore.getState()
            const currentUser = currentUserSelectors.getCurrentUser(state)
            const teams = getTeams(state)
            const { view } = json as ViewUpdatedEvent

            if (isViewSharedWithUser(view as any, currentUser, teams)) {
                reduxStore.dispatch({
                    type: viewsConstants.UPDATE_VIEW_SUCCESS,
                    resp: view,
                })
                reduxStore.dispatch(viewUpdated(view))
            } else {
                reduxStore.dispatch(
                    viewsActions.deleteViewSuccess(view.id) as any,
                )
                reduxStore.dispatch(viewDeleted(view.id))
            }
        },
    },
    {
        name: 'view-deleted',
        onReceive: function (json) {
            reduxStore.dispatch(
                viewsActions.deleteViewSuccess(
                    (json as ViewDeletedEvent).view.id,
                ) as any,
            )
            reduxStore.dispatch(viewDeleted((json as ViewDeletedEvent).view.id))
        },
    },
    {
        name: SocketEventType.ViewSectionCreated,
        onReceive: function (json) {
            reduxStore.dispatch(
                sectionCreated((json as ViewSectionCreatedEvent).view_section),
            )
        },
    },
    {
        name: SocketEventType.ViewSectionUpdated,
        onReceive: function (json) {
            reduxStore.dispatch(
                sectionUpdated((json as ViewSectionUpdatedEvent).view_section),
            )
        },
    },
    {
        name: SocketEventType.ViewSectionDeleted,
        onReceive: function (json) {
            reduxStore.dispatch(
                sectionDeleted(
                    (json as ViewSectionDeletedEvent).view_section.id,
                ),
            )
        },
    },
    {
        name: 'views-count-updated',
        onReceive: function (json) {
            reduxStore.dispatch(
                viewsCountFetched((json as ViewCountUpdatedEvent).counts),
            )
            reduxStore.dispatch(
                viewsActions.handleViewsCount(
                    (json as ViewCountUpdatedEvent).counts,
                ) as any,
            )
        },
    },
    {
        name: SocketEventType.AccountUpdated,
        onReceive: function (json) {
            const state = reduxStore.getState() as RootState
            const plansMap = currentBillingSelectors.getAvailablePlansMap(state)
            const newAccountStatus =
                (json as AccountUpdatedEvent)?.account?.status?.status ||
                'active'
            const notification = (json as AccountUpdatedEvent)?.account?.status
                ?.notification
            const currentAccountStatus =
                //@ts-ignore
                (state.currentAccount as { status?: { status?: string } })
                    ?.status?.status || 'active'

            if (notification) {
                reduxStore.dispatch(
                    notificationsActions.handleUsageBanner({
                        newAccountStatus,
                        currentAccountStatus,
                        notification,
                    }) as any,
                )
            }

            const oldTicketAssignmentSetting =
                currentAccountSelectors.getTicketAssignmentSettings(state)

            const account = (json as AccountUpdatedEvent).account
            const newTicketAssignmentSetting = fromJS(
                _find(
                    account.settings || [],
                    (setting) =>
                        setting.type ===
                        currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                ) || {},
            ) as Map<any, any>

            let shouldFetchChats =
                oldTicketAssignmentSetting.isEmpty() &&
                !newTicketAssignmentSetting.isEmpty()

            if (
                !oldTicketAssignmentSetting.isEmpty() &&
                !newTicketAssignmentSetting.isEmpty()
            ) {
                const autoAssignToTeamSettingHasChanged =
                    newTicketAssignmentSetting.getIn([
                        'data',
                        'auto_assign_to_teams',
                    ]) !==
                    oldTicketAssignmentSetting.getIn([
                        'data',
                        'auto_assign_to_teams',
                    ])

                const oldAssignmentChannels = oldTicketAssignmentSetting.getIn(
                    ['data', 'assignment_channels'],
                    fromJS([]),
                ) as List<any>
                const newAssignmentChannels = newTicketAssignmentSetting.getIn(
                    ['data', 'assignment_channels'],
                    fromJS([]),
                ) as List<any>
                const ticketAssignmentChannelsHaveChanged =
                    !oldAssignmentChannels.equals(newAssignmentChannels)

                if (
                    autoAssignToTeamSettingHasChanged ||
                    (newTicketAssignmentSetting.getIn([
                        'data',
                        'auto_assign_to_teams',
                    ]) &&
                        ticketAssignmentChannelsHaveChanged)
                ) {
                    shouldFetchChats = true
                }
            }

            if (shouldFetchChats) {
                chatsActions.fetchChatsThrottled(reduxStore.dispatch)
            }

            const newAccountProducts =
                account.current_subscription?.products || {}
            const areProductsLoaded = Object.values(newAccountProducts).every(
                (planId) => !!plansMap[planId],
            )

            if (!areProductsLoaded) {
                reduxStore.dispatch(
                    notificationsActions.notify({
                        message:
                            'The app will reload automatically in a few seconds to reflect your subscription changes.',
                    }) as any,
                )
                setTimeout(() => {
                    window.location.reload()
                }, 5000)
            }

            reduxStore.dispatch({
                type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                resp: account,
            })
        },
    },
    {
        name: SocketEventType.SidUpdated,
        onReceive: function () {
            ;(this as unknown as SocketManager).send(SocketEventType.SidUpdated)
        },
    },
    {
        name: SocketEventType.TicketMessageChatCreated,
        onReceive: function (json) {
            const state = reduxStore.getState() as RootState
            const ticket = (json as TicketMessageChatCreatedEvent).data

            const { currentUser } = state

            const ticketAssignmentSetting =
                currentAccountSelectors.getTicketAssignmentSettings(state)
            const currentUserIsAvailable =
                currentUserSelectors.isAvailable(state)

            // mark the chat as read because the agent is viewing the ticket
            if (isCurrentlyOnTicket(ticket.id)) {
                ;(this as unknown as SocketManager).send(
                    SocketEventType.TicketViewed,
                    ticket.id as unknown as string,
                )
                ticket.is_unread = false
            }

            if (
                shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSetting,
                    currentUser,
                    currentUserIsAvailable,
                )
            ) {
                reduxStore.dispatch(
                    chatsActions.addChat(ticket, false, false) as any,
                )
                return
            }

            reduxStore.dispatch(chatsActions.removeChat(ticket.id))

            const { chats } = reduxStore.getState() as RootState

            if ((chats.get('tickets') as List<any>).size < MAX_RECENT_CHATS) {
                chatsActions.fetchChatsThrottled(reduxStore.dispatch)
            }
        },
    },
    {
        name: SocketEventType.TicketChatUpdated,
        onReceive: function (json) {
            const ticket = (json as TicketChatUpdatedEvent).data
            const state = reduxStore.getState() as RootState
            const { currentUser } = state

            const ticketAssignmentSetting =
                currentAccountSelectors.getTicketAssignmentSettings(state)
            const currentUserIsAvailable =
                currentUserSelectors.isAvailable(state)

            if (
                shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSetting,
                    currentUser,
                    currentUserIsAvailable,
                )
            ) {
                reduxStore.dispatch(chatsActions.addChat(ticket, false) as any)
                return
            }

            reduxStore.dispatch(chatsActions.removeChat(ticket.id))

            const { chats } = reduxStore.getState() as RootState

            if ((chats.get('tickets') as List<any>).size < MAX_RECENT_CHATS) {
                chatsActions.fetchChatsThrottled(reduxStore.dispatch)
            }
        },
    },
    {
        name: SocketEventType.EmailIntegrationVerified,
        onReceive: function (json) {
            integrationsActions.onVerify(
                reduxStore.dispatch,
                (json as EmailIntegrationVerifiedEvent).integration_id,
            )
        },
    },
    {
        name: SocketEventType.MigrationIntegrationInboundVerified,
        onReceive: function (json) {
            const integrationId = (json as EmailIntegrationVerifiedEvent)
                .integration_id
            const migration = getEmailMigrations(reduxStore.getState()).find(
                (migration) => migration.integration.id === integrationId,
            )

            if (!migration) return

            integrationsActions.onVerifyMigrationForwarding(
                reduxStore.dispatch,
                integrationId,
                migration.integration.meta.address,
            )
        },
    },
    {
        name: SocketEventType.MigrationIntegrationInboundFailed,
        onReceive: function (json) {
            const integrationId = (json as EmailIntegrationVerifiedEvent)
                .integration_id
            const migration = getEmailMigrations(reduxStore.getState()).find(
                (migration) => migration.integration.id === integrationId,
            )

            if (!migration) return

            integrationsActions.onVerifyMigrationForwardingFailure(
                reduxStore.dispatch,
                integrationId,
                migration?.integration.meta.address,
            )
        },
    },
    {
        name: SocketEventType.EmailForwardingActivated,
        onReceive: function (json) {
            integrationsActions.onEmailForwardingActivated(
                reduxStore.dispatch,
                (json as EmailIntegrationVerifiedEvent).integration_id,
            )
        },
    },
    {
        name: SocketEventType.FacebookIntegrationsReconnected,
        onReceive: function (json) {
            reduxStore.dispatch(integrationsActions.fetchIntegrations() as any)

            reduxStore.dispatch(
                notificationsActions.notify({
                    status: NotificationStatus.Success,
                    message:
                        (json as FacebookIntegrationsReconnected).event
                            .total === 1
                            ? 'One Facebook page has been reconnected.'
                            : `${
                                  (json as FacebookIntegrationsReconnected)
                                      .event.total
                              } Facebook pages have been reconnected.`,
                }) as any,
            )
        },
    },
    {
        name: SocketEventType.OutboundPhoneCallInitiated,
        onReceive: function (json) {
            const { event } = json as unknown as OutboundPhoneCallInitiated
            const {
                phone_ticket_id: phoneTicketId,
                original_path: originalPath,
                tab_id,
            } = event

            if (tab_id === window.CLIENT_ID) {
                logActivityEvent(ActivityEvents.UserStartedPhoneCall, {
                    entityId: phoneTicketId,
                    entityType: 'ticket',
                })
            }

            if (
                window.location.pathname === originalPath &&
                !isSpecificTicketPath(window.location.pathname, phoneTicketId)
            ) {
                history.push(`/app/ticket/${phoneTicketId}`)
            }
        },
    },
    {
        name: SocketEventType.MacroParamsUpdated,
        onReceive: function (json) {
            reduxStore.dispatch({
                type: MACRO_PARAMS_UPDATED,
                payload: fromJS(
                    (json as unknown as MacroParamsUpdatedEvent).event
                        .parameters_options,
                ),
            })
        },
    },
    {
        name: SocketEventType.AgentAvailabilityUpdated,
        onReceive: function (json) {
            reduxStore.dispatch(
                setIsAvailable(
                    (json as AgentAvailabilityUpdatedEvent).data.available,
                ),
            )

            chatsActions.fetchChatsThrottled(reduxStore.dispatch)
        },
    },
    {
        name: SocketEventType.TicketTypingActivityShopperStarted,
        onReceive: function (json) {
            const { ticket } =
                json as unknown as TicketTypingActivityShopperStartedEvent

            reduxStore.dispatch(
                ticketActions.setTypingActivityShopper(ticket.id) as any,
            )
        },
    },
    {
        name: SocketEventType.ViewDeactivated,
        onReceive: function (json) {
            const { event } = json as unknown as ViewDeactivated
            const message = `View "${event.name}" has been deactivated.`

            reduxStore.dispatch(
                notificationsActions.notify({
                    status: NotificationStatus.Warning,
                    allowHTML: true,
                    message,
                }) as any,
            )
        },
    },
    {
        name: SocketEventType.WhatsAppOnboardingSucceeded,
        onReceive: async (data) => {
            const { phone_number } = data as WhatsAppOnboardingSucceededEvent
            const isMigrating = isMigrationInProgress()
            if (isMigrating) {
                return
            }
            const listPath = '/app/settings/integrations/whatsapp/integrations'
            if (window.location.pathname !== listPath) {
                history.push(listPath)
            }
            reduxStore.dispatch(
                notificationsActions.notify({
                    dismissAfter: 10000,
                    message: `WhatsApp successfully connected for number ${phone_number!}.`,
                }) as any,
            )
            reduxStore.dispatch(integrationsActions.fetchIntegrations() as any)
            const phoneNumbers = await fetchNewPhoneNumbers()
            if (phoneNumbers) {
                reduxStore.dispatch(newPhoneNumbersFetched(phoneNumbers.data))
            }
        },
    },
    {
        name: SocketEventType.WhatsAppOnboardingFailed,
        onReceive: (data) => {
            const { phone_number, error } =
                data as WhatsAppOnboardingFailedEvent
            const listPath = '/app/settings/integrations/whatsapp/integrations'
            if (window.location.pathname !== listPath) {
                history.push(listPath)
            }
            const message = error?.message
                ? `${error.message} (number: ${phone_number!})`
                : `Failed to connect WhatsApp for number ${phone_number!}. Please try again or contact support.`
            reduxStore.dispatch(
                notificationsActions.notify({
                    dismissAfter: 10000,
                    status: NotificationStatus.Error,
                    message,
                }) as any,
            )
        },
    },
    {
        name: SocketEventType.VoiceCallCreated,
        onReceive: function (json) {
            const { voice_call } = json as VoiceCallCreatedEvent

            if (!isVoiceCall(voice_call)) return

            appQueryClient.setQueryData<UseListVoiceCalls>(
                voiceCallsKeys.list({ ticket_id: voice_call.ticket_id }),
                (oldData) => {
                    if (!oldData) return

                    return {
                        ...oldData,
                        data: [...oldData.data, voice_call],
                    }
                },
            )
        },
    },
    {
        name: SocketEventType.VoiceCallUpdated,
        onReceive: function (json) {
            const { voice_call } = json as VoiceCallUpdatedEvent

            if (!isVoiceCall(voice_call)) return

            appQueryClient.setQueryData<UseListVoiceCalls>(
                voiceCallsKeys.list({ ticket_id: voice_call.ticket_id }),
                (oldData) => {
                    const voiceCallIndex =
                        oldData?.data.findIndex(
                            (vc) => vc.id === voice_call.id,
                        ) ?? -1

                    if (!oldData || voiceCallIndex === -1) return

                    const newData = cloneDeep(oldData)
                    newData.data[voiceCallIndex] = voice_call

                    return newData
                },
            )
        },
    },
    {
        name: SocketEventType.VoiceCallRecordingUpdated,
        onReceive: async function (json) {
            const { voice_call_recording } =
                json as VoiceCallRecordingUpdatedEvent

            if (!!voice_call_recording.transcription_status) {
                await appQueryClient.refetchQueries(
                    voiceCallsKeys.listRecordings({
                        call_id: voice_call_recording.call_id,
                    }),
                )
            }
        },
    },
    {
        name: SocketEventType.ShopperCreated,
        onReceive: function (json) {
            const eventData = json as ShopperEvent
            reduxStore.dispatch(
                ticketActions.mergeCustomerEcommerceDataShopper(
                    eventData.event.data.customer_id,
                    eventData.event.data.store,
                    eventData.event.data.shopper,
                ),
            )
        },
    },
    {
        name: SocketEventType.ShopperUpdated,
        onReceive: function (json) {
            const eventData = json as ShopperEvent
            reduxStore.dispatch(
                ticketActions.mergeCustomerEcommerceDataShopper(
                    eventData.event.data.customer_id,
                    eventData.event.data.store,
                    eventData.event.data.shopper,
                ),
            )
        },
    },
    {
        name: SocketEventType.ShopperAddressCreated,
        onReceive: function (json) {
            const eventData = json as ShopperAddressEvent
            reduxStore.dispatch(
                ticketActions.mergeCustomerEcommerceDataShopperAddress(
                    eventData.event.data.customer_id,
                    eventData.event.data.store_uuid,
                    eventData.event.data.shopper_address,
                ),
            )
        },
    },
    {
        name: SocketEventType.ShopperAddressUpdated,
        onReceive: function (json) {
            const eventData = json as ShopperAddressEvent
            reduxStore.dispatch(
                ticketActions.mergeCustomerEcommerceDataShopperAddress(
                    eventData.event.data.customer_id,
                    eventData.event.data.store_uuid,
                    eventData.event.data.shopper_address,
                ),
            )
        },
    },
    {
        name: SocketEventType.OrderCreated,
        onReceive: function (json) {
            const eventData = json as OrderEvent
            reduxStore.dispatch(
                ticketActions.mergeCustomerEcommerceDataOrder(
                    eventData.event.data.customer_id,
                    eventData.event.data.store_uuid,
                    eventData.event.data.order,
                ),
            )
        },
    },
    {
        name: SocketEventType.OrderUpdated,
        onReceive: function (json) {
            const eventData = json as OrderEvent
            reduxStore.dispatch(
                ticketActions.mergeCustomerEcommerceDataOrder(
                    eventData.event.data.customer_id,
                    eventData.event.data.store_uuid,
                    eventData.event.data.order,
                ),
            )
        },
    },
]

export default receivedEvents
