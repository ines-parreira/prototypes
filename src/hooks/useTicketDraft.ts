import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {fromJS, List, Map} from 'immutable'
import {useEffectOnce, usePrevious} from 'react-use'
import {RawDraftContentState, SelectionState, convertFromRaw} from 'draft-js'

import {TicketMessageSourceType} from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {Macro} from 'models/macro/types'
import {Ticket} from 'models/ticket/types'
import {convertToRawWithoutPredictions} from 'pages/common/draftjs/plugins/prediction/utils'
import LocalForageManager from 'services/localForageManager/localForageManager'
import {
    restoreNewMessageBodyText,
    restoreNewMessageDraft,
    setSourceType,
} from 'state/newMessage/actions'
import {hasOnlySignatureText} from 'state/newMessage/emailExtraUtils'
import {transformMessageContext} from 'state/newMessage/responseUtils'
import {
    getNewMessage,
    getNewMessageAttachments,
    getNewMessageContentState,
    getNewMessageDiscountCodes,
    getNewMessageSignature,
    getNewMessageSource,
    getNewMessageState,
    getNewMessageType,
    isNewMessageEmailExtraAdded,
} from 'state/newMessage/selectors'
import {Message} from 'state/newMessage/types'
import {
    restoreTicketDraft,
    restoreTicketDraftApplyMacro,
} from 'state/ticket/actions'
import {getAppliedMacro, getProperty} from 'state/ticket/selectors'

export const DRAFT_TICKET_STORE = 'ticket-drafts'

export type TicketDraft = {
    appliedMacro: Macro | null
    assignee_team: Ticket['assignee_team'] | null
    assignee_user: Ticket['assignee_user'] | null
    customer: Ticket['customer'] | null
    attachments: Message['attachments']
    source: Message['source']
    sourceType: TicketMessageSourceType
    subject: string
    ticket: {
        contentState: RawDraftContentState
    } | null
    tags: Ticket['tags']
}

export const isTicketDraftEmpty = (ticketDraft: TicketDraft | null) => {
    if (ticketDraft) {
        const {
            appliedMacro,
            assignee_team,
            assignee_user,
            attachments,
            customer,
            source,
            subject,
            ticket,
            tags,
        } = ticketDraft
        if (ticket && convertFromRaw(ticket?.contentState).hasText()) {
            return false
        }

        return (
            appliedMacro === null &&
            assignee_team === null &&
            assignee_user === null &&
            attachments.length === 0 &&
            customer === null &&
            source.type === TicketMessageSourceType.Email &&
            source.to?.length === 0 &&
            subject === '' &&
            tags.length === 0
        )
    }
    return true
}

export default function useTicketDraft(isTicketNew = false) {
    const localForageRef = useRef<LocalForage>()
    if (!localForageRef.current) {
        localForageRef.current = LocalForageManager.getTable(DRAFT_TICKET_STORE)
    }
    const localForage = localForageRef.current
    const dispatch = useAppDispatch()

    const attachments = useAppSelector(getNewMessageAttachments)
    const source = useAppSelector(getNewMessageSource)
    const assigneeTeam = useAppSelector((state) =>
        getProperty('assignee_team')(state)
    ) as Map<any, any> | null
    const assigneeUser = useAppSelector((state) =>
        getProperty('assignee_user')(state)
    ) as Map<any, any> | null
    const subject = useAppSelector((state) =>
        getProperty('subject')(state)
    ) as unknown as string
    const tags = useAppSelector((state) =>
        getProperty('tags')(state)
    ) as unknown as List<any>
    const customer = useAppSelector((state) =>
        getProperty('customer')(state)
    ) as Map<any, any> | null
    const newMessage = useAppSelector(getNewMessage)
    const newMessageState = useAppSelector(getNewMessageState)
    const bodyText = useMemo(
        () => newMessage.get('body_text') as string,
        [newMessage]
    )
    const newMessageIsEmailExtraAdded = useAppSelector(
        isNewMessageEmailExtraAdded
    )
    const newMessageContentState = useAppSelector(getNewMessageContentState)
    const newMessageSelectionState = useMemo(
        () =>
            newMessageState.getIn([
                'state',
                'selectionState',
            ]) as SelectionState,
        [newMessageState]
    )
    const newMessageSignature = useAppSelector(getNewMessageSignature)
    const isForward = useMemo(
        () => source.getIn(['extra', 'forward']) as boolean,
        [source]
    )
    const newMessageSourceType = useAppSelector(getNewMessageType)
    const sourceType = useMemo(
        () =>
            isForward
                ? TicketMessageSourceType.EmailForward
                : newMessageSourceType,
        [isForward, newMessageSourceType]
    )
    const appliedMacro = useAppSelector(getAppliedMacro)
    const isMacroApplied = !!appliedMacro && !appliedMacro.isEmpty()
    const newMessageDiscountCodes = useAppSelector(getNewMessageDiscountCodes)

    const ticket = useMemo(() => {
        if (
            (newMessageContentState &&
                newMessageContentState.hasText() &&
                !hasOnlySignatureText(
                    newMessageContentState,
                    newMessageSignature || fromJS({})
                )) ||
            isMacroApplied
        ) {
            return {
                contentState: convertToRawWithoutPredictions(
                    newMessageContentState
                ),
                emailExtraAdded: newMessageIsEmailExtraAdded,
                inserted_discounts: newMessageDiscountCodes.toJS(),
                selectionState: newMessageSelectionState?.toJS(),
                sourceType,
            }
        }
        return null
    }, [
        isMacroApplied,
        newMessageContentState,
        newMessageDiscountCodes,
        newMessageIsEmailExtraAdded,
        newMessageSelectionState,
        newMessageSignature,
        sourceType,
    ])

    const reduxState = useMemo(
        () => ({
            appliedMacro: (appliedMacro?.toJS() as Macro) || null,
            assignee_team:
                (assigneeTeam?.toJS() as Ticket['assignee_team']) || null,
            assignee_user:
                (assigneeUser?.toJS() as Ticket['assignee_user']) || null,
            customer: (customer?.toJS() as Ticket['customer']) || null,
            attachments: attachments.toJS() as Message['attachments'],
            source: source.toJS() as Message['source'],
            sourceType: newMessageSourceType,
            subject,
            ticket,
            tags: tags.toJS() as Ticket['tags'],
        }),
        [
            appliedMacro,
            assigneeTeam,
            assigneeUser,
            attachments,
            customer,
            newMessageSourceType,
            source,
            subject,
            ticket,
            tags,
        ]
    )

    const [ticketDraft, setTicketDraft] = useState<TicketDraft | null>(null)

    const isStoredTicketDraftEmpty = useMemo(
        () => isTicketDraftEmpty(ticketDraft),
        [ticketDraft]
    )

    const isNewTicketEmpty = useMemo(
        () =>
            appliedMacro === null &&
            assigneeTeam === null &&
            assigneeUser === null &&
            attachments.size === 0 &&
            bodyText === '' &&
            customer === null &&
            source.get('type') === TicketMessageSourceType.Email &&
            (!!source.get('to')
                ? (source.get('to') as List<any>).size === 0
                : true) &&
            subject === '' &&
            tags.size === 0,
        [
            appliedMacro,
            assigneeTeam,
            assigneeUser,
            attachments,
            bodyText,
            customer,
            source,
            subject,
            tags,
        ]
    )

    const previousIsNewTicketEmpty = usePrevious(isNewTicketEmpty)

    useEffectOnce(() => {
        async function fetchTicketDraft() {
            const draft = (await localForage.getItem('new')) as TicketDraft
            setTicketDraft(draft)
        }
        void fetchTicketDraft()
    })

    const shouldSaveDraft = useMemo(
        () =>
            isTicketNew &&
            ((!isStoredTicketDraftEmpty && !isNewTicketEmpty) ||
                (isStoredTicketDraftEmpty && !isNewTicketEmpty)),
        [isTicketNew, isNewTicketEmpty, isStoredTicketDraftEmpty]
    )

    const persist = useCallback(() => {
        void localForage.setItem('new', reduxState)
    }, [reduxState, localForage])

    const hydrate = useCallback(() => {
        if (ticketDraft) {
            const {
                appliedMacro,
                assignee_team,
                assignee_user,
                attachments,
                customer,
                source,
                sourceType,
                subject,
                ticket,
                tags,
            } = ticketDraft

            dispatch(
                restoreNewMessageDraft({
                    attachments,
                    source,
                })
            )
            dispatch(setSourceType(sourceType))

            dispatch(
                restoreTicketDraft({
                    assignee_team,
                    assignee_user,
                    customer,
                    subject,
                    tags,
                })
            )
            dispatch(restoreTicketDraftApplyMacro(appliedMacro))

            if (ticket) {
                const newTicket = transformMessageContext(
                    fromJS(ticket) as Map<any, any>
                )
                dispatch(restoreNewMessageBodyText(newTicket))
            }
        }
    }, [dispatch, ticketDraft])

    useEffect(() => {
        if (shouldSaveDraft) {
            persist()
        }
    }, [persist, shouldSaveDraft])

    useEffect(() => {
        if (
            isTicketNew &&
            previousIsNewTicketEmpty === false &&
            isNewTicketEmpty
        ) {
            persist()
        }
    }, [isNewTicketEmpty, isTicketNew, persist, previousIsNewTicketEmpty])

    useEffect(() => {
        if (isTicketNew && !isStoredTicketDraftEmpty && isNewTicketEmpty) {
            hydrate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStoredTicketDraftEmpty])
}
