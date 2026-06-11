import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { NewTicketPageContent } from './NewTicketPageContent'

jest.mock('providers/OutboundTranslationProvider', () => ({
    OutboundTranslationProvider: jest.fn(({ children }) => (
        <div data-testid="outbound-translation-provider">{children}</div>
    )),
}))

jest.mock(
    'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider',
    () => ({
        WhatsAppEditorProvider: jest.fn(({ children }) => (
            <div data-testid="whatsapp-editor-provider">{children}</div>
        )),
    }),
)

jest.mock(
    'tickets/pages/NewTicketPage/components/NewTicketPageContent/NewTicketPageEditor',
    () => ({
        NewTicketPageEditor: jest.fn(
            ({
                onRecipientsChange,
                submit,
                subject,
            }: {
                onRecipientsChange: jest.Mock
                submit: jest.Mock
                subject: string
            }) => (
                <div data-testid="new-ticket-page-editor">
                    {subject}
                    <button onClick={() => submit({})}>Submit</button>
                    <button onClick={() => onRecipientsChange('to', [])}>
                        Recipients
                    </button>
                </div>
            ),
        ),
    }),
)

const mockNewTicketPageEditor = jest.mocked(
    jest.requireMock(
        'tickets/pages/NewTicketPage/components/NewTicketPageContent/NewTicketPageEditor',
    ).NewTicketPageEditor,
)

describe('NewTicketPageContent', () => {
    it('renders the new ticket editor inside the WhatsApp editor provider', () => {
        const submit = jest.fn()
        const onRecipientsChange = jest.fn()

        render(
            <NewTicketPageContent
                submit={submit}
                subject="New ticket subject"
                onRecipientsChange={onRecipientsChange}
            />,
        )

        expect(
            screen.getByTestId('outbound-translation-provider'),
        ).toContainElement(screen.getByTestId('whatsapp-editor-provider'))
        expect(screen.getByTestId('whatsapp-editor-provider')).toContainElement(
            screen.getByTestId('new-ticket-page-editor'),
        )
        expect(mockNewTicketPageEditor).toHaveBeenCalledWith(
            {
                submit,
                subject: 'New ticket subject',
                onRecipientsChange,
            },
            {},
        )
    })
})
