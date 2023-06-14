import cn from 'classnames'
import React from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {MacrosProperties} from 'models/macro/types'
import {Ticket} from 'models/ticket/types'
import ReplyMessageChannel from 'pages/tickets/detail/components/ReplyArea/ReplyMessageChannel'
import TicketSubmitButtons from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getNewMessageChannel} from 'state/newMessage/selectors'
import {TicketChannel} from 'business/types/ticket'
import WhatsAppMessageTemplateReplyArea from 'pages/tickets/detail/components/ReplyArea/WhatsAppTemplateReplyArea'

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
    const whatsAppMessageTemplatesEnabled =
        useFlags()[FeatureFlagKey.WhatsAppMessageTemplates]

    const {initialLoaded, loadMacros, macros, nextCursor} = useMacrosSearch({
        filters,
        query,
        ticket,
    })

    const channel = useAppSelector(getNewMessageChannel)
    const isNewTicket = !ticket.id

    const showWhatsAppTemplateEditor =
        whatsAppMessageTemplatesEnabled &&
        isNewTicket &&
        channel === TicketChannel.WhatsApp

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
                    {showWhatsAppTemplateEditor ? (
                        <WhatsAppMessageTemplateReplyArea />
                    ) : (
                        <TicketReplyArea
                            hasShownMacros={hasShown}
                            filters={filters}
                            initialMacrosLoaded={initialLoaded}
                            isMacrosActive={isActive}
                            loadMacros={loadMacros}
                            macros={macros}
                            nextCursor={nextCursor}
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
