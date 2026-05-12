import WhatsAppEditorProvider from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import { OutboundTranslationProvider } from 'providers/OutboundTranslationProvider'
import type { Receiver } from 'state/ticket/utils'
import { NewTicketPageEditor } from 'tickets/pages/NewTicketPage/components/NewTicketPageContent/NewTicketPageEditor'

import css from './NewTicketPageContent.less'

type NewTicketPageContentProps = {
    submit: (args: SubmitArgs) => any
    subject: string
    onRecipientsChange: (prop: string, recipients: Receiver[]) => void
}

export function NewTicketPageContent({
    submit,
    subject,
    onRecipientsChange,
}: NewTicketPageContentProps) {
    return (
        <div className={css.container}>
            <OutboundTranslationProvider>
                <WhatsAppEditorProvider>
                    <NewTicketPageEditor
                        submit={submit}
                        subject={subject}
                        onRecipientsChange={onRecipientsChange}
                    />
                </WhatsAppEditorProvider>
            </OutboundTranslationProvider>
        </div>
    )
}
