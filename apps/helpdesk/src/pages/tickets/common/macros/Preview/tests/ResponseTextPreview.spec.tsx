import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import { TicketMessageSourceType } from 'business/types/ticket'
import { setTextAction } from 'fixtures/macro'

import { ResponseTextPreview } from '../ResponseTextPreview'

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock(
    'pages/common/forms/RichField/TicketRichField',
    () =>
        ({ value }: { value: { html: string; text: string } }) => (
            <div>
                TicketRichField: <div>{value.text}</div>
                <div>{value.html}</div>
            </div>
        ),
)

describe('<ResponseTextPreview />', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)
    })

    it('should render response text preview', () => {
        render(
            <ResponseTextPreview
                responseTextAction={setTextAction}
                displayHTML={false}
                ticketMessageSourceType={undefined}
                isMacroResponseCcBccEnabled={true}
            />,
        )

        setTextAction.arguments.body_text!.split('\n\n').forEach((text) => {
            expect(screen.getByText(new RegExp(text, 'i'))).toBeInTheDocument()
        })
    })

    it('should render CC and BCC when feature flag is enabled and values exist', () => {
        const actionWithCcBcc = {
            ...setTextAction,
            arguments: {
                ...setTextAction.arguments,
                cc: 'cc@example.com',
                bcc: 'bcc@example.com',
            },
        }

        render(
            <ResponseTextPreview
                responseTextAction={actionWithCcBcc}
                displayHTML={false}
                ticketMessageSourceType={undefined}
                isMacroResponseCcBccEnabled={true}
            />,
        )

        expect(screen.getByText('Add as CC:')).toBeInTheDocument()
        expect(screen.getByText('cc@example.com')).toBeInTheDocument()
        expect(screen.getByText('Add as BCC:')).toBeInTheDocument()
        expect(screen.getByText('bcc@example.com')).toBeInTheDocument()
    })

    it('should not render CC and BCC when feature flag is disabled', () => {
        const actionWithCcBcc = {
            ...setTextAction,
            arguments: {
                ...setTextAction.arguments,
                cc: 'cc@example.com',
                bcc: 'bcc@example.com',
            },
        }

        render(
            <ResponseTextPreview
                responseTextAction={actionWithCcBcc}
                displayHTML={false}
                ticketMessageSourceType={undefined}
                isMacroResponseCcBccEnabled={false}
            />,
        )

        expect(screen.queryByText('Add as CC:')).not.toBeInTheDocument()
        expect(screen.queryByText('Add as BCC:')).not.toBeInTheDocument()
    })

    it('should not render CC and BCC when values are empty', () => {
        const actionWithEmptyCcBcc = {
            ...setTextAction,
            arguments: {
                ...setTextAction.arguments,
                cc: '',
                bcc: '',
            },
        }

        render(
            <ResponseTextPreview
                responseTextAction={actionWithEmptyCcBcc}
                displayHTML={false}
                ticketMessageSourceType={undefined}
                isMacroResponseCcBccEnabled={true}
            />,
        )

        expect(screen.queryByText('Add as CC:')).not.toBeInTheDocument()
        expect(screen.queryByText('Add as BCC:')).not.toBeInTheDocument()
    })

    it('should return null when no response text action is provided', () => {
        const { container } = render(
            <ResponseTextPreview
                responseTextAction={undefined}
                displayHTML={false}
                ticketMessageSourceType={undefined}
                isMacroResponseCcBccEnabled={true}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle HTML content when displayHTML is true', () => {
        const actionWithHtml = {
            ...setTextAction,
            arguments: {
                ...setTextAction.arguments,
                body_html: '<p>HTML content</p>',
            },
        }

        render(
            <ResponseTextPreview
                responseTextAction={actionWithHtml}
                displayHTML={true}
                ticketMessageSourceType={undefined}
                isMacroResponseCcBccEnabled={true}
            />,
        )

        expect(screen.getByText(/HTML content/)).toBeInTheDocument()
    })

    it('should handle Facebook Messenger source type', () => {
        const actionWithHtml = {
            ...setTextAction,
            arguments: {
                ...setTextAction.arguments,
                body_html: '<p>HTML content</p>',
            },
        }

        render(
            <ResponseTextPreview
                responseTextAction={actionWithHtml}
                displayHTML={false}
                ticketMessageSourceType={
                    TicketMessageSourceType.FacebookMessenger
                }
                isMacroResponseCcBccEnabled={true}
            />,
        )

        expect(screen.getByText(/HTML content/)).toBeInTheDocument()
    })
})
