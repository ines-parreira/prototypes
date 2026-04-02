import { useEffect, useMemo } from 'react'

import cn from 'classnames'

import type { ListMacrosParams } from '@gorgias/helpdesk-queries'

import { TicketMessageSourceType } from 'business/types/ticket'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { MacrosProperties } from 'models/macro/types'
import type { Ticket } from 'models/ticket/types'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import ChannelSelect from 'pages/tickets/detail/components/ReplyArea/ChannelSelect'
import MessageSourceFields from 'pages/tickets/detail/components/ReplyArea/MessageSourceFields/MessageSourceFields'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import TicketSubmitButtons from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons'
import WhatsAppMessageTemplateReplyArea from 'pages/tickets/detail/components/ReplyArea/WhatsAppTemplateReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import { prepare } from 'state/newMessage/actions'
import { getNewMessageType } from 'state/newMessage/selectors'

import useForm from './hooks/useForm'
import useMacros from './hooks/useMacros'
import useMacrosSearch from './hooks/useMacrosSearch'

import css from './Editor.less'

type Filters = Pick<
    ListMacrosParams,
    'languages' | 'tags' | 'search' | 'cursor'
>

type Props = {
    canEdit?: boolean
    internalNotesOnly?: boolean
    initialMacroFilters: MacrosProperties
    onBlur?: () => void
    onFocus?: () => void
    submit: (args: SubmitArgs) => any
    ticket: Ticket
}

export const SEARCH_DEBOUNCE_DELAY = 350

export default function Editor({
    canEdit = true,
    internalNotesOnly = false,
    initialMacroFilters,
    onBlur,
    onFocus,
    submit,
    ticket,
}: Props) {
    const dispatch = useAppDispatch()
    const { hasAccess } = useAiAgentAccess()
    const { showWhatsAppTemplateEditor } = useWhatsAppEditor()
    const newMessageType = useAppSelector(getNewMessageType)

    const { formRef, onSubmit } = useForm(submit)
    const {
        hasShown,
        filters,
        isActive,
        query,
        onChangeActive,
        onChangeFilters,
        onChangeQuery,
    } = useMacros({ initialFilters: initialMacroFilters })

    const params: Filters = useMemo(
        () => ({ ...filters, search: query }),
        [filters, query],
    )
    const availableChannels = useMemo(
        () =>
            internalNotesOnly
                ? [TicketMessageSourceType.InternalNote]
                : undefined,
        [internalNotesOnly],
    )

    const { data, fetchNextPage, isLoading, nextCursor } = useMacrosSearch({
        params,
        ticket,
    })

    useEffect(() => {
        if (
            internalNotesOnly &&
            newMessageType !== TicketMessageSourceType.InternalNote
        ) {
            dispatch(prepare(TicketMessageSourceType.InternalNote))
        }
    }, [dispatch, internalNotesOnly, newMessageType])

    return (
        <div
            className={cn('d-print-none', css.container, {
                [css.disabled]: !canEdit,
            })}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-disabled={!canEdit}
        >
            <form ref={formRef} id="ticket-reply-editor" onSubmit={onSubmit}>
                <div className={css.replyChannel}>
                    <ChannelSelect
                        channelsOverride={availableChannels}
                        selectedChannelOverride={
                            internalNotesOnly
                                ? TicketMessageSourceType.InternalNote
                                : undefined
                        }
                    />
                    {!internalNotesOnly && <MessageSourceFields />}
                </div>
                <ReplyForm>
                    {showWhatsAppTemplateEditor && (
                        <WhatsAppMessageTemplateReplyArea />
                    )}

                    {!showWhatsAppTemplateEditor && (
                        <TicketReplyArea
                            hasShownMacros={hasShown}
                            hasAutomate={hasAccess}
                            filters={filters}
                            isMacrosLoading={isLoading}
                            isMacrosActive={isActive}
                            loadMacros={fetchNextPage}
                            macros={data}
                            nextCursor={nextCursor ?? undefined}
                            query={query}
                            onChangeFilters={onChangeFilters}
                            onChangeMacrosActive={onChangeActive}
                            onChangeQuery={onChangeQuery}
                        />
                    )}
                    <TicketSubmitButtons submit={submit} />
                </ReplyForm>
            </form>
        </div>
    )
}
