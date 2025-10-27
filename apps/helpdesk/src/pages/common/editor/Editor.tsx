import { useMemo } from 'react'

import cn from 'classnames'

import { ListMacrosParams } from '@gorgias/helpdesk-queries'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { MacrosProperties } from 'models/macro/types'
import { Ticket } from 'models/ticket/types'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import ChannelSelect from 'pages/tickets/detail/components/ReplyArea/ChannelSelect'
import MessageSourceFields from 'pages/tickets/detail/components/ReplyArea/MessageSourceFields/MessageSourceFields'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import TicketSubmitButtons from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons'
import WhatsAppMessageTemplateReplyArea from 'pages/tickets/detail/components/ReplyArea/WhatsAppTemplateReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'

import useForm from './hooks/useForm'
import useMacros from './hooks/useMacros'
import useMacrosSearch from './hooks/useMacrosSearch'

import css from './Editor.less'

type Filters = Pick<
    ListMacrosParams,
    'languages' | 'tags' | 'search' | 'cursor'
>

type Props = {
    initialMacroFilters: MacrosProperties
    onBlur?: () => void
    onFocus?: () => void
    submit: (args: SubmitArgs) => any
    ticket: Ticket
}

export const SEARCH_DEBOUNCE_DELAY = 350

export default function Editor({
    initialMacroFilters,
    onBlur,
    onFocus,
    submit,
    ticket,
}: Props) {
    const { hasAccess } = useAiAgentAccess()
    const { showWhatsAppTemplateEditor } = useWhatsAppEditor()

    const { formRef, onSubmit, setTicketStatus } = useForm(submit)
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

    const { data, fetchNextPage, isLoading, nextCursor } = useMacrosSearch({
        params,
        ticket,
    })

    return (
        <div
            className={cn('d-print-none', css.container)}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            <form ref={formRef} id="ticket-reply-editor" onSubmit={onSubmit}>
                <div className={css.replyChannel}>
                    <ChannelSelect />
                    <MessageSourceFields />
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
                    <TicketSubmitButtons setTicketStatus={setTicketStatus} />
                </ReplyForm>
            </form>
        </div>
    )
}
