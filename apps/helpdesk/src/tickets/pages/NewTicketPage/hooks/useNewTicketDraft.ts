import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { localForageManager } from '@repo/browser-storage'
import type { TicketFieldsState } from '@repo/tickets'
import { useTicketFieldsStore } from '@repo/tickets'
import type { SelectionState } from 'draft-js'
import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty, isEqual } from '@gorgias/toolkit'
import { useEffectOnce, usePrevious } from '@gorgias/toolkit-react'

import type {
    Macro,
    TicketPriority,
    TicketTag,
    TicketTeam,
    TicketUser,
} from '@gorgias/helpdesk-queries'

import { TicketMessageSourceType } from 'business/types/ticket'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import type { TicketDraft } from 'hooks/useTicketDraft'
import { DRAFT_TICKET_STORE, isTicketDraftEmpty } from 'hooks/useTicketDraft'
import type { Ticket } from 'models/ticket/types'
import { convertToRawWithoutPredictions } from 'pages/common/draftjs/plugins/prediction/utils'
import {
    restoreNewMessageBodyText,
    restoreNewMessageDraft,
    setSourceType,
} from 'state/newMessage/actions'
import { hasOnlySignatureText } from 'state/newMessage/emailExtraUtils'
import { transformMessageContext } from 'state/newMessage/responseUtils'
import {
    getNewMessageAttachments,
    getNewMessageContentState,
    getNewMessageDiscountCodes,
    getNewMessageSignature,
    getNewMessageSource,
    getNewMessageState,
    getNewMessageType,
    getOriginalContentState,
    isNewMessageEmailExtraAdded,
} from 'state/newMessage/selectors'
import type { Message } from 'state/newMessage/types'
import {
    restoreTicketDraft,
    restoreTicketDraftApplyMacro,
} from 'state/ticket/actions'
import { getAppliedMacro } from 'state/ticket/selectors'

type UseNewTicketDraftArgs = {
    subject: string
    priority: TicketPriority | undefined
    assigneeUser: TicketUser | null
    assigneeTeam: TicketTeam | null
    tags: TicketTag[]
    customer: Ticket['customer'] | null
}

export type RestoredLocalState = {
    subject: string
    priority: TicketPriority | undefined
    assigneeUser: TicketUser | null
    assigneeTeam: TicketTeam | null
    tags: TicketTag[]
    customFields: TicketFieldsState
    customer: Ticket['customer'] | null
}

export function useNewTicketDraft({
    subject,
    priority,
    assigneeUser,
    assigneeTeam,
    tags,
    customer,
}: UseNewTicketDraftArgs) {
    const localForageRef = useRef<LocalForage>()
    const { initializeFields, resetFields } = useTicketFieldsStore()
    if (!localForageRef.current) {
        localForageRef.current = localForageManager.getTable(DRAFT_TICKET_STORE)
    }
    const localForage = localForageRef.current
    const dispatch = useAppDispatch()

    const attachments = useAppSelector(getNewMessageAttachments)
    const source = useAppSelector(getNewMessageSource)
    const newMessageState = useAppSelector(getNewMessageState)
    const newMessageIsEmailExtraAdded = useAppSelector(
        isNewMessageEmailExtraAdded,
    )
    const newMessageContentState = useAppSelector(getNewMessageContentState)
    const originalContentState = useAppSelector(getOriginalContentState)
    const newMessageSelectionState = useMemo(
        () =>
            newMessageState.getIn([
                'state',
                'selectionState',
            ]) as SelectionState,
        [newMessageState],
    )
    const newMessageSignature = useAppSelector(getNewMessageSignature)
    const isForward = useMemo(
        () => source.getIn(['extra', 'forward']) as boolean,
        [source],
    )
    const newMessageSourceType = useAppSelector(getNewMessageType)
    const sourceType = useMemo(
        () =>
            isForward
                ? TicketMessageSourceType.EmailForward
                : newMessageSourceType,
        [isForward, newMessageSourceType],
    )
    const appliedMacro = useAppSelector(getAppliedMacro)
    const isMacroApplied = !!appliedMacro && !appliedMacro.isEmpty()
    const newMessageDiscountCodes = useAppSelector(getNewMessageDiscountCodes)
    const customFields = useTicketFieldsStore((state) => state.fields)

    const ticket = useMemo(() => {
        if (
            (newMessageContentState &&
                newMessageContentState.hasText() &&
                !hasOnlySignatureText(
                    newMessageContentState,
                    newMessageSignature || fromJS({}),
                )) ||
            isMacroApplied
        ) {
            return {
                contentState: convertToRawWithoutPredictions(
                    newMessageContentState,
                ),
                emailExtraAdded: newMessageIsEmailExtraAdded,
                inserted_discounts: newMessageDiscountCodes.toJS(),
                selectionState: newMessageSelectionState?.toJS(),
                sourceType,
                ...(originalContentState && {
                    originalContentState:
                        convertToRawWithoutPredictions(originalContentState),
                }),
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
        originalContentState,
        sourceType,
    ])

    const temporaryId = useRef<string | null>(null)
    const isHydratingStoredDraftRef = useRef(false)

    const draftState = useMemo(
        () =>
            ({
                appliedMacro: (appliedMacro?.toJS() as Macro) || null,
                assignee_team: assigneeTeam as Ticket['assignee_team'] | null,
                assignee_user: assigneeUser as Ticket['assignee_user'] | null,
                custom_fields: customFields as Ticket['custom_fields'],
                customer,
                priority,
                attachments: attachments.toJS() as Message['attachments'],
                source: source.toJS() as Message['source'],
                sourceType: newMessageSourceType,
                subject,
                ticket,
                tags: tags as Ticket['tags'],
                temporaryId: temporaryId.current ?? '',
            }) satisfies TicketDraft,
        [
            appliedMacro,
            assigneeTeam,
            assigneeUser,
            attachments,
            customFields,
            customer,
            newMessageSourceType,
            priority,
            source,
            subject,
            ticket,
            tags,
        ],
    )

    const bodyText = useMemo(
        () =>
            newMessageContentState?.hasText()
                ? newMessageContentState.getPlainText()
                : '',
        [newMessageContentState],
    )

    const isDraftEmptyExceptCustomFields = useMemo(
        () =>
            appliedMacro === null &&
            assigneeTeam === null &&
            assigneeUser === null &&
            attachments.size === 0 &&
            bodyText === '' &&
            customer === null &&
            priority === undefined &&
            source.get('type') === TicketMessageSourceType.Email &&
            (!!source.get('to')
                ? (source.get('to') as List<any>).size === 0
                : true) &&
            subject === '' &&
            tags.length === 0,
        [
            appliedMacro,
            assigneeTeam,
            assigneeUser,
            attachments,
            bodyText,
            customer,
            priority,
            source,
            subject,
            tags,
        ],
    )

    const isDraftEmpty = useMemo(
        () => isDraftEmptyExceptCustomFields && isEmpty(customFields),
        [customFields, isDraftEmptyExceptCustomFields],
    )

    const previousIsDraftEmpty = usePrevious(isDraftEmpty)

    const [storedDraft, setStoredDraft] = useState<TicketDraft | null>(null)
    const [hasLoadedStoredDraft, setHasLoadedStoredDraft] = useState(false)
    const [restoredLocalState, setRestoredLocalState] =
        useState<RestoredLocalState | null>(null)
    const [hasAppliedRestoredLocalState, setHasAppliedRestoredLocalState] =
        useState(false)

    const isStoredDraftEmpty = useMemo(
        () => isTicketDraftEmpty(storedDraft),
        [storedDraft],
    )

    const syncCustomFieldsStore = useCallback(
        (customFields?: Ticket['custom_fields']) => {
            resetFields()
            if (customFields && !isEmpty(customFields)) {
                initializeFields(customFields as TicketFieldsState)
            }
        },
        [initializeFields, resetFields],
    )

    useEffectOnce(() => {
        async function fetchTicketDraft() {
            const draft = (await localForage.getItem('new')) as TicketDraft
            setStoredDraft(draft)
            if (draft && draft.temporaryId && !isTicketDraftEmpty(draft)) {
                temporaryId.current = draft.temporaryId
                if (isDraftEmptyExceptCustomFields) {
                    isHydratingStoredDraftRef.current = true
                    syncCustomFieldsStore()
                }
            } else {
                temporaryId.current = uuidv4()
                syncCustomFieldsStore()
            }
            setHasLoadedStoredDraft(true)
        }
        void fetchTicketDraft()
    })

    const shouldHydrateStoredDraft =
        hasLoadedStoredDraft &&
        !isStoredDraftEmpty &&
        !restoredLocalState &&
        isDraftEmptyExceptCustomFields

    const isRestoredLocalStateApplied = useMemo(() => {
        if (!restoredLocalState) {
            return true
        }

        return (
            subject === restoredLocalState.subject &&
            priority === restoredLocalState.priority &&
            isEqual(assigneeUser, restoredLocalState.assigneeUser) &&
            isEqual(assigneeTeam, restoredLocalState.assigneeTeam) &&
            isEqual(customer, restoredLocalState.customer) &&
            isEqual(tags, restoredLocalState.tags)
        )
    }, [
        assigneeTeam,
        assigneeUser,
        customer,
        priority,
        restoredLocalState,
        subject,
        tags,
    ])

    useEffect(() => {
        if (restoredLocalState && isRestoredLocalStateApplied) {
            isHydratingStoredDraftRef.current = false
            setHasAppliedRestoredLocalState(true)
        }
    }, [isRestoredLocalStateApplied, restoredLocalState])

    const shouldWaitForRestoredLocalState =
        isHydratingStoredDraftRef.current ||
        (!!restoredLocalState && !hasAppliedRestoredLocalState)

    const shouldSaveDraft = useMemo(
        () =>
            hasLoadedStoredDraft &&
            !shouldHydrateStoredDraft &&
            !shouldWaitForRestoredLocalState &&
            ((!isStoredDraftEmpty && !isDraftEmpty) ||
                (isStoredDraftEmpty && !isDraftEmpty)),
        [
            hasLoadedStoredDraft,
            isDraftEmpty,
            isStoredDraftEmpty,
            shouldHydrateStoredDraft,
            shouldWaitForRestoredLocalState,
        ],
    )

    const persist = useCallback(() => {
        void localForage.setItem('new', draftState)
    }, [draftState, localForage])

    const hydrate = useCallback(() => {
        if (storedDraft) {
            isHydratingStoredDraftRef.current = true
            const {
                appliedMacro,
                assignee_team,
                assignee_user,
                attachments,
                custom_fields,
                customer,
                priority,
                source,
                sourceType,
                subject,
                ticket,
                tags,
            } = storedDraft

            dispatch(
                restoreNewMessageDraft({
                    attachments,
                    source,
                }),
            )
            dispatch(setSourceType(sourceType))

            dispatch(
                restoreTicketDraft({
                    assignee_team,
                    assignee_user,
                    custom_fields,
                    customer,
                    subject,
                    tags,
                }),
            )
            dispatch(restoreTicketDraftApplyMacro(appliedMacro))

            if (ticket) {
                const newTicket = transformMessageContext(
                    fromJS(ticket) as Map<any, any>,
                )
                dispatch(restoreNewMessageBodyText(newTicket))
            }

            syncCustomFieldsStore(custom_fields)

            setRestoredLocalState({
                subject,
                priority,
                assigneeUser: assignee_user as TicketUser | null,
                assigneeTeam: assignee_team as TicketTeam | null,
                tags: tags as TicketTag[],
                customFields: (custom_fields ?? {}) as TicketFieldsState,
                customer,
            })
        }
    }, [dispatch, storedDraft, syncCustomFieldsStore])

    useEffect(() => {
        if (shouldSaveDraft) {
            persist()
        }
    }, [persist, shouldSaveDraft])

    useEffect(() => {
        if (
            hasLoadedStoredDraft &&
            !shouldHydrateStoredDraft &&
            !shouldWaitForRestoredLocalState &&
            previousIsDraftEmpty === false &&
            isDraftEmpty
        ) {
            persist()
        }
    }, [
        hasLoadedStoredDraft,
        isDraftEmpty,
        persist,
        previousIsDraftEmpty,
        shouldHydrateStoredDraft,
        shouldWaitForRestoredLocalState,
    ])

    useEffect(() => {
        if (shouldHydrateStoredDraft) {
            hydrate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldHydrateStoredDraft])

    return {
        temporaryId: temporaryId.current,
        restoredLocalState,
        shouldAutoFocusSubject: hasLoadedStoredDraft && !storedDraft?.subject,
    }
}
