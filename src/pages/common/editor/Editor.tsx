import cn from 'classnames'
import React from 'react'

import {MacrosProperties} from 'models/macro/types'
import {Ticket} from 'models/ticket/types'
import ReplyMessageChannel from 'pages/tickets/detail/components/ReplyArea/ReplyMessageChannel'
import TicketSubmitButtons from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'
import WhatsAppMessageTemplateReplyArea from 'pages/tickets/detail/components/ReplyArea/WhatsAppTemplateReplyArea'

import {useWhatsAppEditor} from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorContext'
import useForm from './hooks/useForm'
import useMacros from './hooks/useMacros'
import useMacrosSearch from './hooks/useMacrosSearch'
import css from './Editor.less'

type Props = {
    initialMacroFilters: MacrosProperties
    onBlur?: () => void
    onFocus?: () => void
    submit: (args: SubmitArgs) => any
    ticket: Ticket
}

export default function Editor({
    initialMacroFilters,
    onBlur,
    onFocus,
    submit,
    ticket,
}: Props) {
    const {
        showWhatsAppTemplateEditor,
        whatsAppMessageTemplatesEnabled,
        isFreeFormWhatsAppMessage,
    } = useWhatsAppEditor()
    const {formRef, onSubmit, setTicketStatus} = useForm(submit)
    const {
        hasShown,
        filters,
        isActive,
        query,
        onChangeActive,
        onChangeFilters,
        onChangeQuery,
    } = useMacros({initialFilters: initialMacroFilters})

    const {initialLoaded, loadMacros, macros, nextCursor} = useMacrosSearch({
        filters,
        query,
        ticket,
    })

    const isNewTicket = !ticket.id

    const showFreeFormEditor =
        !showWhatsAppTemplateEditor || isFreeFormWhatsAppMessage

    return (
        <div
            className={cn('d-print-none', css.container)}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            <form ref={formRef} id="ticket-reply-editor" onSubmit={onSubmit}>
                <ReplyMessageChannel
                    whatsAppMessageTemplatesEnabled={
                        whatsAppMessageTemplatesEnabled
                    }
                />
                <ReplyForm>
                    {showWhatsAppTemplateEditor && (
                        <WhatsAppMessageTemplateReplyArea
                            isNewTicket={isNewTicket}
                        />
                    )}

                    {showFreeFormEditor && (
                        <TicketReplyArea
                            hasShownMacros={hasShown}
                            filters={filters}
                            initialMacrosLoaded={initialLoaded}
                            isMacrosActive={
                                isActive && !showWhatsAppTemplateEditor
                            }
                            loadMacros={loadMacros}
                            macros={macros}
                            nextCursor={nextCursor}
                            query={query}
                            onChangeFilters={onChangeFilters}
                            onChangeMacrosActive={onChangeActive}
                            onChangeQuery={onChangeQuery}
                            hideMacroSearch={showWhatsAppTemplateEditor}
                        />
                    )}
                    <TicketSubmitButtons setTicketStatus={setTicketStatus} />
                </ReplyForm>
            </form>
        </div>
    )
}
