import cn from 'classnames'
import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {MacrosProperties} from 'models/macro/types'
import {Ticket} from 'models/ticket/types'
import DEPRECATED_ReplyMessageChannel from 'pages/tickets/detail/components/ReplyArea/DEPRECATED_ReplyMessageChannel'
import TicketSubmitButtons from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'
import ChannelSelect from 'pages/tickets/detail/components/ReplyArea/ChannelSelect'
import MessageSourceFields from 'pages/tickets/detail/components/ReplyArea/MessageSourceFields/MessageSourceFields'
import WhatsAppMessageTemplateReplyArea from 'pages/tickets/detail/components/ReplyArea/WhatsAppTemplateReplyArea'
import {FeatureFlagKey} from 'config/featureFlags'

import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
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
    const {showWhatsAppTemplateEditor, whatsAppMessageTemplatesEnabled} =
        useWhatsAppEditor()
    const newReplyChannelEnabled =
        useFlags()[FeatureFlagKey.TaapNewReplyMessageChannelSelector]

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

    return (
        <div
            className={cn('d-print-none', css.container)}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            <form ref={formRef} id="ticket-reply-editor" onSubmit={onSubmit}>
                {newReplyChannelEnabled ? (
                    <div className={css.replyChannel}>
                        <ChannelSelect />
                        <MessageSourceFields />
                    </div>
                ) : (
                    <DEPRECATED_ReplyMessageChannel
                        whatsAppMessageTemplatesEnabled={
                            whatsAppMessageTemplatesEnabled
                        }
                    />
                )}
                <ReplyForm>
                    {showWhatsAppTemplateEditor && (
                        <WhatsAppMessageTemplateReplyArea />
                    )}

                    {!showWhatsAppTemplateEditor && (
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
