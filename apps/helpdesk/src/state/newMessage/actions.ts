import { createAction } from '@reduxjs/toolkit'
import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import * as Sentry from '@sentry/react'
import type { AxiosError, CancelToken } from 'axios'
import { isCancel } from 'axios'
import { ContentState, convertFromHTML } from 'draft-js'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _assign from 'lodash/assign'
import _isNull from 'lodash/isNull'
import _omit from 'lodash/omit'
import _pick from 'lodash/pick'
import _split from 'lodash/split'

import type { Macro } from '@gorgias/helpdesk-queries'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import {
    fetchTicketReplyMacro,
    triggerTicketFieldsRefreshAndInvalidation,
} from 'common/state'
import type { GenericAttachment } from 'common/types'
import { AttachmentEnum } from 'common/types'
import { isImmutable, uploadFiles } from 'common/utils'
import { ActionTemplateExecution } from 'config'
import { UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS } from 'config/integrations/shopify'
import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { ShopifyProductCardContentType } from 'constants/integrations/shopify'
import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import client from 'models/api/resources'
import type { Customer } from 'models/customer/types'
import type { DiscountCode } from 'models/discountCodes/types'
import type { MacroAction } from 'models/macroAction/types'
import { MacroActionName, MacroActionType } from 'models/macroAction/types'
import { search } from 'models/search/resources'
import type { UserSearchResult } from 'models/search/types'
import { SearchType } from 'models/search/types'
import { mapNormalizedToArray } from 'models/ticket/mappers'
import type {
    Attachment,
    TicketAssignee,
    Ticket as TicketResponse,
} from 'models/ticket/types'
import { renderTemplate } from 'pages/common/utils/template'
import type {
    AttachmentPosition,
    AttachmentType,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import { ActivityEvents, logActivityEvent } from 'services/activityTracker'
import { isNewChannel } from 'services/channels'
import {
    getCurrentAccountState,
    getDefaultIntegrationSettings,
} from 'state/currentAccount/selectors'
import * as integrationSelectors from 'state/integrations/selectors'
import { NEW_MESSAGE_SUBMIT_TICKET_ERROR } from 'state/newMessage/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import * as ticketConstants from 'state/ticket/constants'
import { getAllCustomerIdsFromTicket } from 'state/ticket/helpers'
import * as ticketSelectors from 'state/ticket/selectors'
import type { FullTicketStateWithoutImmutable } from 'state/ticket/types'
import {
    getLastSameSourceTypeMessage,
    getNewMessageSender,
    getSourceTypeOfResponse,
    guessReceiversFromTicket,
    persistLastSenderChannel,
    receiversStateFromValue,
    receiversValueFromState,
} from 'state/ticket/utils'
import type { CurrentUser, RootState, StoreDispatch } from 'state/types'
import {
    castGorgiasVideosForUnsupportedSources,
    getActionTemplate,
    toJS,
} from 'utils'
import { getMomentNow } from 'utils/date'
import { convertToHTML } from 'utils/editor'
import { reportError } from 'utils/errors'

import type { CustomerChannel } from '../../models/customerChannel/types'
import * as constants from './constants'
import type { EmailExtraArgs } from './emailExtraUtils'
import {
    addEmailExtraContent,
    deleteEmailExtraContent,
    getReplyThreadMessages,
} from './emailExtraUtils'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from './errors'
import type { MessageContext } from './responseUtils'
import {
    selectionAfter,
    setSourceTypeCache,
    toReplyAreaState,
    updateNewMessageWithContentState,
} from './responseUtils'
import * as selectors from './selectors'
import type { MacroActions, Message, NewMessage, ReplyAreaState } from './types'
import {
    applyExternalTemplateAction,
    getProductCardAttachmentsDeletionOrder,
    transformToInternalNote,
    upsertNewMessageAction,
} from './utils'

export const addAttachments =
    (ticket: Map<any, any>, atts: FileList | GenericAttachment[] | File[]) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ): Promise<ReturnType<StoreDispatch>> | ReturnType<StoreDispatch> => {
        dispatch({
            type: constants.NEW_MESSAGE_ADD_ATTACHMENT_START,
        })

        const { newMessage } = getState()

        let attachments = atts
        const newMessageSourceType = newMessage.getIn([
            'newMessage',
            'source',
            'type',
        ])
        const isFacebookComment =
            newMessageSourceType === TicketMessageSourceType.FacebookComment
        const isFacebookReviewComment =
            newMessageSourceType ===
            TicketMessageSourceType.FacebookReviewComment

        if (isFacebookComment || isFacebookReviewComment) {
            // We have specific constraints on attachments.

            const attachmentsFiltered: FileList | GenericAttachment[] =
                Object.values(atts).filter((att: File | GenericAttachment) => {
                    const type =
                        att.type || (att as GenericAttachment).content_type
                    return type.startsWith('image') || type.startsWith('video')
                })

            const previousAtts: List<any> =
                newMessage.getIn(['newMessage', 'attachments']) || fromJS([])

            if (
                previousAtts.size > 0 ||
                atts.length > 1 ||
                atts.length !== attachmentsFiltered.length
            ) {
                void dispatch(
                    notify({
                        id: 'newMessageAddAttachmentsError',
                        dismissAfter: 0,
                        status: NotificationStatus.Error,
                        title: 'We could not add all of your attachments !',
                        allowHTML: true,
                        message: `
                    Facebook comments have limitations on attachments:
                    <ul>
                        <li>You cannot send more than one attachment.</li>
                        <li>You can only send images or videos.</li>
                    </ul>
                `,
                    }),
                )
                return dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
                })
            }

            attachments =
                previousAtts.size > 0 ? [] : attachmentsFiltered.slice(0, 1)
        }

        return uploadFiles(attachments).then(
            (resp: GenericAttachment[]) => {
                const state = getState()
                const { ticket: _ticket } = state

                if (ticket.get('id') !== _ticket.get('id')) {
                    return Promise.resolve()
                }

                dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                    resp,
                })
            },
            (error: AxiosError) => {
                if (error.response?.status === 413) {
                    return dispatch({
                        type: constants.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
                        error,
                        reason: 'Failed to upload files. One or more files are larger than the size limit of 10MB.',
                    })
                }

                return dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
                    error,
                    reason: 'Failed to upload files. Please try again later',
                })
            },
        )
    }

export const addAttachment =
    (
        ticket: Map<any, any>,
        attachment: AttachmentType,
        sortAttachments?: boolean,
    ) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ): Promise<ReturnType<StoreDispatch>> | ReturnType<StoreDispatch> => {
        const state = getState()
        const { ticket: _ticket } = state

        if (ticket.get('id') !== _ticket.get('id')) {
            return Promise.resolve()
        }

        if (attachment.content_type === AttachmentEnum.ProductRecommendation) {
            const indicesToDelete = getProductCardAttachmentsDeletionOrder(
                selectors.getNewMessageAttachments(state).toArray() as Map<
                    any,
                    any
                >[],
            )
            indicesToDelete.forEach((index) =>
                dispatch(deleteAttachment(index)),
            )
        }

        dispatch({
            type: !!sortAttachments
                ? constants.NEW_MESSAGE_ADD_SORTED_ATTACHMENT_SUCCESS
                : constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
            resp: [attachment],
        })
    }

export const deleteAttachment = (index: number) => ({
    type: constants.NEW_MESSAGE_DELETE_ATTACHMENT,
    index,
})

export const updateCampaignProductPosition = createAction<{
    productId: number
    position: AttachmentPosition
}>(constants.UPDATE_CAMPAIGN_PRODUCT_POSITION)

export const setResponseText =
    (args: Map<any, any> = fromJS({})) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): ReturnType<StoreDispatch> => {
        const state = getState()
        const { ticket, currentUser } = state
        const ticketId = ticket.get('id') as string
        const signature = selectors.getNewMessageSignature(state)

        const topRankMacroState = ticketSelectors.getTopRankMacroState(state)
        // should have the same params in state/ticket/actions/applyMacroAction
        return dispatch({
            type: constants.SET_RESPONSE_TEXT,
            args,
            ticketId,
            forceFocus: args.get('forceFocus', false),
            forceUpdate: args.get('forceUpdate', false),
            ticket, // used in middleware, not in reducer
            appliedMacro: ticket.getIn(['state', 'appliedMacro']),
            currentUser, // used in middleware, not in reducer
            signature,
            fromMacro: false, // used in middleware, not in reducer
            topRankMacroState,
        })
    }

export const addEmailExtra = createAction<{
    contentState: ContentState
    emailExtraArgs: EmailExtraArgs
}>(constants.NEW_MESSAGE_ADD_EMAIL_EXTRA)

/**
 * Set new message receivers
 */
export const setReceivers = (
    receivers: Record<string, unknown> = {},
    replaceAll = true,
) => ({
    type: constants.NEW_MESSAGE_SET_RECEIVERS,
    receivers,
    replaceAll,
})

export const setActiveCustomerAsReceiver =
    () => (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const ticket = state.ticket

        // We only change this when type is Email
        if (ticket.getIn(['channel']) !== TicketChannel.Email) {
            return
        }

        const customerChannels: CustomerChannel[] =
            (
                ticket.getIn(['customer', 'channels']) as List<CustomerChannel>
            )?.toJS() || []

        const customerChannel = customerChannels.find(
            (channel: CustomerChannel) => channel.type === TicketChannel.Email,
        )

        const address = customerChannel
            ? customerChannel.address
            : ticket.getIn(['customer', 'email'])
        const name = ticket.getIn(['customer', 'name'])

        if (address && name) {
            void dispatch(setReceivers({ to: [{ name, address }] }, false))
        }
    }

/**
 * Set new message sender. A sender is represented by an integration (email or gmail)
 */
export const setSender =
    (sender?: Maybe<string>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): ReturnType<StoreDispatch> => {
        const state = getState()
        const { integrations, ticket } = state
        const sourceType = selectors.getNewMessageType(state)
        const { getSendersForChannel } = integrationSelectors
        const defaultSettings = getDefaultIntegrationSettings(state)

        const channels = fromJS(
            getSendersForChannel(sourceType)(state),
        ) as List<any>

        let _sender: Map<any, any> = fromJS({})
        if (sender) {
            _sender =
                channels.find(
                    (channel: Map<any, any>) =>
                        channel.get('address') === sender,
                ) || fromJS({})
        }

        if (_sender.isEmpty()) {
            _sender =
                getNewMessageSender(
                    ticket,
                    sourceType,
                    channels,
                    integrations,
                    defaultSettings,
                ) || fromJS({})
        }

        if (!_sender.isEmpty()) {
            const id = _sender.get('id')

            _sender = fromJS({
                name: _sender.get('name', ''),
                address: _sender.get('address', ''),
            })

            if (sourceType === TicketMessageSourceType.Phone) {
                _sender = _sender.set('id', id)
            }

            // persist `_sender` only if it's explicitly set on the function call (i.e: when user selects value from dropdown)
            if (sender) {
                persistLastSenderChannel(_sender)
            }
        }

        return dispatch({
            type: constants.NEW_MESSAGE_SET_SENDER,
            sender: _sender,
        })
    }

export const setSourceType =
    (sourceType: TicketMessageSourceType) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch({
            type: constants.NEW_MESSAGE_SET_SOURCE_TYPE,
            sourceType,
            messages: getState().ticket.get('messages'),
        })
    }

export const setSubject = (subject = '') => ({
    type: constants.NEW_MESSAGE_SET_SUBJECT,
    subject,
})

export const setSourceExtra = (extra: Record<string, unknown>) => ({
    type: constants.NEW_MESSAGE_SET_SOURCE_EXTRA,
    extra,
})

export const setMeta = (meta: Record<string, unknown>) => ({
    type: constants.NEW_MESSAGE_SET_META,
    meta,
})

export const setNewMessageActions = (actions?: MacroAction[]) => ({
    type: constants.SET_NEW_MESSAGE_ACTIONS,
    payload: actions,
})

export const addNewMessageDiscountCode = (
    ticketId: string,
    discountCode: DiscountCode,
) => ({
    type: constants.SET_NEW_MESSAGE_DISCOUNT_CODE,
    discountCode,
    ticketId,
})

/**
 * Prepare default message
 */
const prepareDefault =
    (sourceType: TicketMessageSourceType) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch(setSubject())
        dispatch(setSourceType(sourceType))
        dispatch(setSourceExtra({}))
        dispatch(setNewMessageActions())
        resetReceiversAndSender(dispatch, getState)
    }

/**
 * Prepare the new message based on its source type
 */
export const prepare =
    (sourceType: TicketMessageSourceType) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const currentTicket = ticketSelectors.DEPRECATED_getTicket(state)
        // cache source type when changed
        setSourceTypeCache(currentTicket.get('id'), sourceType)

        //Clean up productCard attachments for unsupported channels
        if (
            sourceType !== TicketMessageSourceType.Chat &&
            sourceType !== TicketMessageSourceType.InternalNote
        ) {
            const indicesToDelete = getProductCardAttachmentsDeletionOrder(
                selectors.getNewMessageAttachments(state).toArray() as Map<
                    any,
                    any
                >[],
            )
            indicesToDelete.forEach((index) =>
                dispatch(deleteAttachment(index)),
            )
        }

        //Clean up videos for unsupported sources.
        if (
            sourceType !== TicketMessageSourceType.Chat &&
            sourceType !== TicketMessageSourceType.InternalNote
        ) {
            const newMessageState = selectors.getNewMessageState(state)
            const contentState = newMessageState.getIn([
                'state',
                'contentState',
            ]) as ContentState

            if (contentState) {
                const contentHtml = convertToHTML(contentState)

                // NOTE. TicketMessageSourceType includes TicketChannel values so casting to string to compare works.
                const hyperlinksSupported =
                    !UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS.map((x) =>
                        x.toString(),
                    ).includes(sourceType as string)

                const newHtmlContent = castGorgiasVideosForUnsupportedSources({
                    html: contentHtml,
                    hyperlinksSupported: hyperlinksSupported,
                })

                const changesFound = newHtmlContent !== contentHtml
                const contentBlocks =
                    convertFromHTML(newHtmlContent)?.contentBlocks ?? null
                // Do not update if contentBlocks was empty or no changes.
                if (changesFound && contentBlocks) {
                    const newContentState =
                        ContentState.createFromBlockArray(contentBlocks)
                    const newSelectionState = selectionAfter(
                        newContentState.getBlocksAsArray() as any,
                    )

                    dispatch(
                        setResponseText(
                            fromJS({
                                contentState: newContentState,
                                selectionState: newSelectionState,
                                dirty: true,
                                forceFocus: true,
                                forceUpdate: true,
                            }),
                        ),
                    )
                }
            }
        }

        switch (sourceType) {
            case TicketMessageSourceType.EmailForward: {
                //$TsFixMe remove casting once ticket selectors are migrated
                const messages = (
                    ticketSelectors.getMessages as (
                        state: RootState,
                    ) => List<any>
                )(state)
                let attachments: FileList | Attachment[] = []
                messages.forEach((message: Map<any, any>) => {
                    attachments = (attachments as Array<Attachment>).concat(
                        toJS<Attachment[]>(
                            (message.get('attachments') ||
                                fromJS([])) as List<any>,
                        ),
                    )
                })

                const currentAttachments =
                    selectors.getNewMessageAttachments(state)
                const currentAttachmentsUrls = currentAttachments.map(
                    (attachment: Map<any, any>) =>
                        attachment.get('url') as string,
                ) as List<any>

                // Filter out all attachments already present in the state, to avoid setting them again when changing
                // the source type to `email-forward` multiple times, also remove productCard attachments
                attachments = attachments.filter(
                    (attachment) =>
                        !currentAttachmentsUrls.includes(attachment.url) &&
                        attachment.content_type !==
                            ShopifyProductCardContentType,
                )

                dispatch(
                    setSubject(
                        `Fwd: ${currentTicket.get('subject', '') as string}`,
                    ),
                )
                dispatch(setSourceType(TicketMessageSourceType.Email))
                dispatch(setSourceExtra({ forward: true }))
                dispatch(setSender())
                void dispatch(setReceivers())
                dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                    resp: attachments,
                })
                break
            }
            case TicketMessageSourceType.InternalNote: {
                const contentState = selectors.getNewMessageContentState(state)
                const userInputContentState =
                    deleteEmailExtraContent(contentState)

                let responseTextArgs = fromJS({
                    contentState: userInputContentState,
                    forceFocus: true,
                    forceUpdate: true,
                }) as Map<string, unknown>

                if (contentState !== userInputContentState) {
                    responseTextArgs = responseTextArgs.set(
                        'emailExtraAdded',
                        false,
                    )
                }
                dispatch(setResponseText(responseTextArgs))
                dispatch(prepareDefault(sourceType))

                break
            }
            case TicketMessageSourceType.InstagramComment:
            case TicketMessageSourceType.InstagramAdComment:
            case TicketMessageSourceType.InstagramMentionComment: {
                // If we're preparing a new Instagram comment message, we want to insert a mention of format `@username `
                // with the user name of the customer
                dispatch(prepareDefault(sourceType))
                const newState = getState()
                const newMessageState = selectors.getNewMessageState(newState)
                const receiverName = newMessageState.getIn(
                    ['newMessage', 'source', 'to', 0, 'name'],
                    '',
                ) as string
                const contentState = newMessageState.getIn([
                    'state',
                    'contentState',
                ]) as ContentState

                // If there's already text in the contentState, or there's no receiver's name, we don't want to add the
                // mention
                if ((contentState && contentState.hasText()) || !receiverName) {
                    return
                }

                const newContentState = ContentState.createFromText(
                    `@${receiverName} `,
                )
                const newSelectionState = selectionAfter(
                    newContentState.getBlocksAsArray() as any,
                )

                dispatch(
                    setResponseText(
                        fromJS({
                            contentState: newContentState,
                            selectionState: newSelectionState,
                            dirty: true,
                            forceFocus: true,
                            forceUpdate: true,
                        }),
                    ),
                )
                break
            }
            default: {
                dispatch(prepareDefault(sourceType))
                break
            }
        }
    }

/**
 * Only getting potential customers and calling a callback
 * No reducer action after that
 */
export const updatePotentialCustomers =
    (
        query: string,
        type: SearchType = SearchType.UserChannelEmail,
        cancelToken?: CancelToken,
    ) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> =>
        search<UserSearchResult>({
            type,
            query,
            cancelToken,
        }).then(
            (resp) => {
                return {
                    ...resp,
                    data: resp.data.map((result) => {
                        return {
                            ...result,
                            ...result.user,
                        }
                    }),
                }
            },
            (error: AxiosError) => {
                if (isCancel(error)) {
                    return Promise.resolve() as unknown
                }
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Failed to do the search. Please try again...',
                })
            },
        )

export const initializeMessageDraft = () => (dispatch: StoreDispatch) => {
    // get cached macro
    dispatch(fetchTicketReplyMacro())
    // get cached ticket reply message
    dispatch(setResponseText())
}

/**
 * Perform various actions on the ticket data and return a POST-able ticket data structure.
 * Adds the newMessage to the ticket's messages, attaches actions and sets some source elements on the message.
 * Also sets some properties on the ticket.
 */
export function prepareTicketDataToSend(
    dispatch: StoreDispatch,
    getState: () => RootState,
    ticketState: Map<any, any>,
    newMessageState: Map<any, any>,
    status: Maybe<string>,
    actionsForMacro: Maybe<MacroActions>,
    currentUser: CurrentUser,
    emailThreadSizeFF?: boolean,
): Maybe<{
    ticket: FullTicketStateWithoutImmutable
    newMessage: NewMessage
    replyAreaState: ReplyAreaState
}> {
    const ticket = toJS<FullTicketStateWithoutImmutable>(ticketState)
    const replyAreaState = toReplyAreaState(
        newMessageState.get('state') as Map<any, any>,
    )
    let newMessage = (
        newMessageState.get('newMessage') as Map<any, any>
    )?.toJS() as NewMessage

    if (newMessage?.source?.to) {
        newMessage = {
            ...newMessage,
            source: {
                ...newMessage.source,
                to: newMessage?.source?.to?.map(({ name, address }) => ({
                    name,
                    address,
                })),
            },
        }
    }

    ticket.status = (status as TicketStatus) || ticket.status

    if (ticket.assignee_user) {
        ticket.assignee_user = { id: ticket.assignee_user.id } as TicketAssignee
    }

    // Prepare newMessage to send it.
    if (newMessage) {
        const state = getState()
        let actions = actionsForMacro

        // Transform empty message with macro to internal note
        if (!selectors.hasContent(state) && !!ticket.state?.appliedMacro) {
            const { newMessage: editedNewMessage, newActions } =
                transformToInternalNote(
                    newMessage,
                    actions,
                    `Applied macro "${
                        (ticket.state.appliedMacro as Macro).name
                    }"`,
                )
            newMessage = editedNewMessage
            actions = newActions
        }

        const sourceType = newMessage.source.type
        const { emailExtraAdded, contentState } = replyAreaState

        const isFacebookComment =
            newMessage.channel === TicketMessageSourceType.Facebook &&
            newMessage.source.type === TicketMessageSourceType.FacebookComment

        const isFacebookReviewComment =
            newMessage.channel ===
                TicketMessageSourceType.FacebookRecommendations &&
            newMessage.source.type ===
                TicketMessageSourceType.FacebookReviewComment

        if (sourceType === TicketMessageSourceType.Email && !emailExtraAdded) {
            const newContentState = addEmailExtraContent(contentState, {
                signature: selectors.getNewMessageSignature(state),
                replyThreadMessages: getReplyThreadMessages(
                    ticketSelectors.getBody(state).toJS(),
                ),
                ticket: ticketState.toJS(),
                isForwarded: selectors.isForward(state),
            })

            newMessage = updateNewMessageWithContentState(
                newMessage,
                newContentState,
                emailThreadSizeFF,
            )
            replyAreaState.emailExtraAdded = true
            replyAreaState.contentState = newContentState
        }

        const lastSameTypeMessage = getLastSameSourceTypeMessage(
            ticketState.get('messages'),
            sourceType,
        )

        if (ticket.messages.length && lastSameTypeMessage) {
            const lastMessage = lastSameTypeMessage.toJS() as NewMessage

            if (lastMessage.source.extra) {
                newMessage.source.extra = _assign(
                    {},
                    newMessage.source.extra,
                    lastMessage.source.extra,
                )
            }
        }

        // i.e. if we're creating a new ticket
        if (!ticket.messages.length) {
            ticket.channel = newMessage.channel as TicketChannel
        }

        if (!newMessage.sender) {
            newMessage.sender = fromJS(
                _pick(currentUser.toJS(), ['email', 'id', 'name']),
            )
        }

        // Facebook does not accept comment with just an attachment.
        if (isFacebookComment || isFacebookReviewComment) {
            if (
                newMessage.body_text.length === 0 &&
                newMessage.attachments.length > 0
            ) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        title: 'Your message cannot be sent',
                        message:
                            'You cannot send an attachment without a message in a Facebook comment.',
                    }),
                )
                return null
            }
        }

        newMessage.actions = isImmutable(newMessage.actions)
            ? newMessage.actions
            : fromJS(newMessage.actions)

        if (actions) {
            newMessage.actions = actions
                .map((curAction: Map<any, any> = fromJS({})) =>
                    formatAction(
                        curAction,
                        fromJS(getActionTemplate(curAction.get('name'))),
                        {
                            ticket: ticketState.toJS(),
                            currentUser: currentUser.toJS(),
                        },
                    ),
                )
                .concat(newMessage.actions ?? fromJS([])) as List<Map<any, any>>
        }

        if (
            newMessage.channel === TicketChannel.WhatsApp &&
            newMessage.actions
        ) {
            newMessage = applyExternalTemplateAction(newMessage)
        }

        const discountCodes = prepareNewMessageDiscountCodes(
            state,
            ticket,
            newMessage,
            ticket.channel,
        )
        if (discountCodes?.length) {
            newMessage.meta = newMessage.meta || {}
            newMessage.meta.discount_codes = discountCodes
        }
    }

    return {
        replyAreaState,
        ticket: _omit(ticket, [
            'state',
            '_internal',
            'newMessage',
        ]) as FullTicketStateWithoutImmutable,
        newMessage,
    }
}

export const prepareNewMessageDiscountCodes = (
    state: RootState,
    ticket: FullTicketStateWithoutImmutable,
    newMessage: NewMessage,
    channel: string,
): string[] => {
    const discountCodes = selectors.getNewMessageDiscountCodes(state)
    if (!discountCodes || discountCodes.isEmpty()) return []

    let currentMessage = newMessage.body_text
    // email channel can have previous messages with old discount codes attached
    if (channel === TicketChannel.Email) {
        if (newMessage.stripped_text) {
            // stripped text is without previous messages
            currentMessage = newMessage.stripped_text
        } else {
            // if agent modifies previous messages, there's no stripped text
            // there's a risk of having old discount codes present
            // only delimiter which is likely to be present unless deleted by agent
            const delimiter = '</a>&gt; wrote:'
            currentMessage = _split(newMessage.body_html, delimiter, 2)[0]
        }
    }

    // only select discount codes which were not removed from the message text
    const confirmedDiscountCodes = discountCodes.filter(
        (discountCode: Map<any, any>) => {
            return currentMessage.includes(discountCode.get('code'))
        },
    )
    if (confirmedDiscountCodes?.isEmpty()) return []

    const currentAccount = getCurrentAccountState(state)
    const customerData = getAllCustomerIdsFromTicket(
        fromJS(ticket),
        (integration) =>
            integration.get('__integration_type__') ===
            SHOPIFY_INTEGRATION_TYPE,
    )
    confirmedDiscountCodes.forEach((discountCode: Map<any, any>) => {
        logEvent(SegmentEvent.InsertDiscountCodeAdded, {
            account_domain: currentAccount?.get('domain'),
            channel: newMessage.channel,
            discount: {
                id: discountCode.get('id'),
                code: discountCode.get('code'),
                title: discountCode.get('title'),
            },
            ticket: ticket.id || 'new',
            customer: customerData,
        })
    })

    return confirmedDiscountCodes
        .map(
            (discountCode: Map<any, any>) => discountCode.get('code') as string,
        )
        .flatten()
        .toArray() as string[]
}

export const formatAction = (
    action: Map<any, any>,
    template: Map<any, any>,
    context: Record<string, unknown>,
) => {
    /**
     * Verify if any argument of the action is a `listDict`, i.e. a data structure as such :
     *
     * [
     *   {
     *     key: k1,
     *     value: v1,
     *     ... // anything else
     *   },
     *   {
     *     key: k2,
     *     value: v2,
     *     ...
     *   },
     *   ...
     * ]
     *
     * which must be transformed into a dict before sending to the server (the other fields being
     * useful for the UI only).
     *
     * {
     *   k1: v1,
     *   k2: v2,
     *   ...
     * }
     *
     */

    let newArgs: Map<any, any> = fromJS({})
    const actionArguments = action.get('arguments') as List<any>

    actionArguments.forEach((value, key) => {
        if (template.getIn(['arguments', key, 'type']) === 'listDict') {
            newArgs = newArgs.set(key, fromJS({}))
            ;(value as List<any>).forEach((element: Map<any, any>) => {
                if (element.get('value') !== '') {
                    newArgs = newArgs.setIn(
                        [key, renderTemplate(element.get('key'), context)],
                        renderTemplate(element.get('value'), context),
                    )
                }
            })
        } else {
            newArgs = newArgs.set(key, value)
        }
    })

    return action
        .set('arguments', newArgs)
        .set(
            'status',
            template.get('execution') !== ActionTemplateExecution.Front
                ? 'pending'
                : 'success',
        )
}

/**
 * Perform actions when we successfully create a new message.
 */
function onMessageSent(dispatch: StoreDispatch) {
    // reinitialize the current macro
    dispatch({
        type: ticketConstants.APPLY_MACRO,
        macro: undefined,
    })
}

export function prepareTicketMessage({
    status,
    macroActions,
    resetMessage = true,
    retryMessage,
    emailThreadSizeFF,
}: {
    status?: TicketStatus
    macroActions?: MacroActions
    resetMessage?: boolean
    retryMessage?: Map<any, any>
    emailThreadSizeFF?: boolean
} = {}) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<{
        messageId: number
        messageToSend: NewMessage
        replyAreaState: ReplyAreaState
    }> =>
        new Promise((resolve, reject) => {
            const state = getState()
            const { ticket, currentUser, newMessage } = state
            // temporary message id
            let messageId = getMomentNow()
            let messageToSend: NewMessage
            let replyAreaState = toReplyAreaState(newMessage.get('state'))

            // message already parsed
            if (!!retryMessage) {
                messageId = retryMessage.getIn(['_internal', 'id'])
                messageToSend = retryMessage.get('originalMessage')
            } else {
                const dataToSend = prepareTicketDataToSend(
                    dispatch,
                    getState,
                    ticket,
                    newMessage,
                    status,
                    macroActions,
                    currentUser,
                    emailThreadSizeFF,
                )

                if (!dataToSend || _isNull(dataToSend)) {
                    dispatch({
                        type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                        reason: 'Message was not sent. Sent data is invalid.',
                        messageId,
                    })
                    return reject(new TicketMessageInvalidSendDataError())
                }

                if (dataToSend.newMessage.channel === TicketChannel.Email) {
                    // When email extra content (signature/thread) was added to the composer,
                    // it's visible and editable by the agent. Always use frontend's version
                    // to respect what the agent sees and intends to send - whether they edited
                    // it (deletions, modifications) or are sending it as-is.
                    // Note: Read from original replyAreaState (before mutation by prepareTicketDataToSend)
                    const threadHistoryVisibleInComposer =
                        replyAreaState.emailExtraAdded

                    const shouldLetBackendRebuildThread =
                        emailThreadSizeFF && !threadHistoryVisibleInComposer

                    messageToSend = {
                        ...dataToSend.newMessage,
                        ticket_id: ticket?.get('id'),
                        source: {
                            ...dataToSend.newMessage.source,
                            extra: shouldLetBackendRebuildThread
                                ? {
                                      ...dataToSend.newMessage.source.extra,
                                      include_thread: true,
                                  }
                                : {
                                      ...dataToSend.newMessage.source.extra,
                                      include_thread: false,
                                  },
                        },
                    }
                } else {
                    messageToSend = {
                        ...dataToSend.newMessage,
                        ticket_id: ticket?.get('id'),
                    }
                }

                replyAreaState = dataToSend.replyAreaState
            }

            if (isNewChannel(messageToSend?.source?.type)) {
                messageToSend = _omit(messageToSend, 'source.type')
                if (messageToSend?.source?.from?.address) {
                    const integration =
                        integrationSelectors.getIntegrationByAddress(
                            messageToSend.source.from.address,
                        )(state)

                    if (integration) {
                        messageToSend.integration_id = integration.id
                    }
                }
            }

            // Execute front-end validations for each action of the message
            if (messageToSend.actions) {
                for (const messageAction of messageToSend.actions as any) {
                    const template = getActionTemplate(
                        (fromJS(messageAction) as Map<any, any>).get('name'),
                    )

                    // We can't just have a fallback in the get, in case ticket.customer.data === null
                    const customer: Record<string, unknown> = (
                        (ticket.getIn(['customer']) || fromJS({})) as Map<
                            any,
                            any
                        >
                    ).toJS()
                    if (template && template.validators) {
                        for (const validator of template.validators) {
                            const res = validator.validate(
                                customer as unknown as Customer,
                            )

                            if (!res) {
                                dispatch({
                                    type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                                    error: 'Action validation error.',
                                    reason: validator.error,
                                    message: messageToSend,
                                    messageId,
                                })
                                return reject(
                                    new TicketMessageActionValidationError(
                                        validator.error,
                                    ),
                                )
                            }
                        }
                    }
                }
            }

            if (status === TicketStatus.Closed) {
                const closeTicketAction = formatAction(
                    fromJS({
                        name: MacroActionName.SetStatus,
                        type: MacroActionType.User,
                        title: 'Set status',
                        arguments: {
                            status: TicketStatus.Closed,
                        },
                    }),
                    fromJS(getActionTemplate(MacroActionName.SetStatus)),
                    {},
                )
                messageToSend = upsertNewMessageAction(
                    messageToSend,
                    closeTicketAction,
                )
            }

            const topRankMacroState =
                ticketSelectors.getTopRankMacroState(state)
            const appliedMacro = ticketSelectors.getAppliedMacro(state)

            if (
                topRankMacroState?.state === 'pending' &&
                appliedMacro &&
                appliedMacro.get('id') === topRankMacroState.macroId
            ) {
                logEvent(SegmentEvent.TopRankMacro, {
                    action: 'accepted',
                    user_id: state.currentUser.get('id'),
                    ticketId: state.ticket.get('id'),
                    macro: appliedMacro.toJS(),
                })
            }

            Sentry.addBreadcrumb({
                message: `Preparing ticket message: ${messageToSend.body_text?.substring(
                    0,
                    50,
                )}...`,
                data: {
                    status,
                    retryMessage,
                    resetMessage,
                },
                level: 'info',
            })

            dispatch({
                type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                message: messageToSend,
                messageId,
                resetMessage,
                retry: !!retryMessage,
                status: status,
                //$TsFixMe remove casting once ticket selectors are migrated
                messages: (
                    ticketSelectors.getMessages as (
                        state: RootState,
                    ) => List<any>
                )(state),
                ticketId: ticket.get('id'),
                ticketVia: ticket.get('via'),
                events: ticket.get('events'),
            })

            onMessageSent(dispatch)

            // clear the message (since it was just sent) but force the focus on the field
            dispatch(
                setResponseText(
                    fromJS({ forceFocus: true, forceUpdate: true }),
                ),
            )
            dispatch(resetReceiversAndSender)
            resolve({
                messageId,
                messageToSend,
                replyAreaState,
            })

            dispatch({
                type: ticketConstants.SET_TOP_RANK_MACRO_STATE,
                ticketId: ticket.get('id'),
                topRankMacroState: null,
            })
        })
}

export function sendTicketMessage(
    messageId: number,
    messageToSend: NewMessage,
    action: Maybe<string>,
    resetMessage = true,
    ticketId?: Maybe<string>,
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<Message> =>
        new Promise((resolve) => {
            const { ticket } = getState()
            let promise

            const ticketIdArg = ticketId || (ticket.get('id') as number)
            const ticketIdToUse = messageToSend?.ticket_id ?? ticketIdArg

            if (action) {
                promise = client.put<Message>(
                    `/api/tickets/${ticketIdToUse}/messages/${
                        messageToSend.id || ''
                    }/${action ? `?action=${action}` : ''}`,
                    messageToSend,
                )
            } else {
                promise = client.post<Message>(
                    `/api/tickets/${ticketIdToUse}/messages/`,
                    messageToSend,
                )
            }

            if (
                messageToSend?.ticket_id &&
                Number(messageToSend?.ticket_id) !== Number(ticketIdArg)
            ) {
                reportError(new Error('Invalid ticket message request.'), {
                    extra: {
                        ticket_id_arg: ticketId,
                        ticket_id_redux: ticket.get('id'),
                        ticket_id_used: ticketIdToUse,
                        ticket_id_new_message: messageToSend?.ticket_id,
                    },
                })
            }

            void promise
                .then((json) => json?.data)
                .then(
                    (resp) => {
                        const state = getState()
                        const { ticket: _ticket } = state

                        // if we changed the displayed ticket (e.g. submit and close), we don't want to change the state.
                        if (
                            !(
                                resp.ticket_id !== _ticket.get('id') &&
                                _ticket.get('id')
                            )
                        ) {
                            //$TsFixMe remove casting once ticket selectors are migrated
                            const messages = (
                                ticketSelectors.getMessages as (
                                    state: RootState,
                                ) => List<any>
                            )(state)
                            const via = ticketSelectors.getVia(state)

                            dispatch({
                                type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_SUCCESS,
                                resetMessage,
                                resp,
                                messages,
                                messageId,
                            })
                            const sourceTypeOfResponse =
                                getSourceTypeOfResponse(
                                    messages.push(resp),
                                    via,
                                    _ticket.get('id'),
                                )
                            if (
                                [
                                    TicketMessageSourceType.InstagramComment,
                                    TicketMessageSourceType.InstagramAdComment,
                                    TicketMessageSourceType.InstagramMentionComment,
                                    TicketMessageSourceType.Sms,
                                ].includes(sourceTypeOfResponse)
                            ) {
                                dispatch(prepare(sourceTypeOfResponse))
                            }
                        }

                        return Promise.resolve(resp)
                    },
                    (error: AxiosError) => {
                        return dispatch({
                            type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                            error,
                            verbose: true,
                            reason: 'Message was not sent. Please try again in a few moments. If the problem persists contact us.',
                            message: messageToSend,
                            messageId,
                        })
                    },
                )
                .then(resolve as any)
        })
}

export function retrySubmitTicketMessage(message: Map<any, any>) {
    return (dispatch: StoreDispatch) => {
        return dispatch(
            prepareTicketMessage({
                status: message.getIn(['_internal', 'status']),
                resetMessage: false,
                retryMessage: message,
            }),
        ).then(({ messageId, messageToSend }) => {
            return dispatch(
                sendTicketMessage(messageId, messageToSend, null, false),
            )
        })
    }
}

export function submitTicket(
    ticket: Map<any, any>,
    status: Maybe<string>,
    macroActions: Maybe<MacroActions>,
    currentUser: CurrentUser,
    resetMessage = true,
    temporaryTicketId: string | null = null,
) {
    return async (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const { newMessage } = getState()

        dispatch({
            type: constants.NEW_MESSAGE_SUBMIT_TICKET_START,
        })

        const dataToSend = prepareTicketDataToSend(
            dispatch,
            getState,
            ticket,
            newMessage,
            status,
            macroActions,
            currentUser,
        )

        // in case of,
        // error is dispatched by prepareTicketDataToSend
        if (!dataToSend) {
            return null
        }

        try {
            const ticketToSend = dataToSend.ticket
            // Types are so so wrong in there
            //$TsFixMe
            //@ts-ignore
            ticketToSend.messages.push(dataToSend.newMessage)

            // De-normalize custom fields values and make sure they only contain values
            // that are not empty. Discard any other keys
            const customFields =
                ticketToSend.custom_fields &&
                mapNormalizedToArray(ticketToSend.custom_fields)
                    .filter(
                        (customField) =>
                            !isCustomFieldValueEmpty(customField.value),
                    )
                    .map(({ id, value }) => ({ id, value }))

            const response = await client.post<TicketResponse>(
                '/api/tickets/',
                {
                    ...ticketToSend,
                    custom_fields: customFields,
                },
            )

            const data = response?.data

            onMessageSent(dispatch)

            logActivityEvent(ActivityEvents.UserCreatedTicket, {
                entityId: data.id,
                entityType: 'ticket',
                temporaryId: temporaryTicketId,
            })

            history.push(`/app/ticket/${data.id}`)

            const state = getState()
            const { ticket } = state

            if (data.id !== ticket.get('id') && ticket.get('id')) {
                return Promise.resolve({ resp: data })
            }

            dispatch(resetReceiversAndSender)
            // dispatch for newMessage and ticket reducer branch
            return dispatch({
                type: constants.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                resetMessage,
                resp: data,
            })
        } catch (error) {
            void dispatch(triggerTicketFieldsRefreshAndInvalidation())
            return dispatch({
                type: NEW_MESSAGE_SUBMIT_TICKET_ERROR,
                error,
                verbose: true,
                reason: 'Ticket was not created. Please try again in a few moments. If the problem persists contact us',
            })
        }
    }
}

export function resetFromTicket(ticket: Map<any, any>) {
    return (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        dispatch({
            type: constants.NEW_MESSAGE_RESET_FROM_TICKET,
            ticket,
        })
        return dispatch(resetReceiversAndSender)
    }
}

export function resetReceiversAndSender(
    dispatch: StoreDispatch,
    getState: () => RootState,
): ReturnType<StoreDispatch> {
    const state = getState()
    const { ticket } = state
    const type = selectors.getNewMessageType(state)
    // set receivers according to last sent message
    const receivers = guessReceiversFromTicket(
        ticket,
        type,
        integrationSelectors.getChannelsByType(type)(state),
    )
    const receiversValues = receiversValueFromState(receivers, type)
    void dispatch(setReceivers(receiversStateFromValue(receiversValues, type)))
    // set sender according to last sent message
    return dispatch(setSender())
}

export const newMessageResetFromMessage = createAction<{
    newMessage: NewMessage
    replyAreaState: ReplyAreaState
}>(constants.NEW_MESSAGE_RESET_FROM_MESSAGE)

export const setShowConvertToForwardPopover = createAction<boolean>(
    constants.NEW_MESSAGE_SHOW_CONVERT_TO_FORWARD_POPOVER,
)

export const setNewMessageForChatCampaign = createAction<{
    attachments?: List<any>
    channel?: TicketChannel
    sourceType?: TicketMessageSourceType
}>(constants.SET_NEW_MESSAGE_CHAT_CAMPAIGN)

export const restoreNewMessageDraft = createAction<
    Pick<NewMessage, 'attachments' | 'source'>
>(constants.RESTORE_NEW_MESSAGE_DRAFT)

export const restoreNewMessageBodyText = createAction<MessageContext>(
    constants.RESTORE_NEW_MESSAGE_BODY_TEXT,
)

export const setTranslationState = createAction<{
    translatedContentState: ContentState
}>(constants.SET_TRANSLATION_STATE)

export const clearTranslationState = createAction(
    constants.CLEAR_TRANSLATION_STATE,
)
