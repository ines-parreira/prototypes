import { render } from '@repo/testing/vitest'
import { screen, waitFor } from '@testing-library/react'

import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import { server } from '../../../../../../tests/server'
import { OrderNote } from '../OrderNote'

const mockExecuteAction = mockExecuteActionHandler()

describe('OrderNote', () => {
    beforeEach(() => {
        server.use(mockExecuteAction.handler)
    })

    it('renders textarea with initial note value', () => {
        render(
            <OrderNote
                note="Handle with care"
                integrationId={1}
                orderId={123}
            />,
        )

        expect(
            screen.getByRole('textbox', { name: /order note/i }),
        ).toHaveValue('Handle with care')
    })

    it('renders placeholder when note is empty', () => {
        render(<OrderNote note={undefined} integrationId={1} orderId={123} />)

        expect(
            screen.getByRole('textbox', { name: /order note/i }),
        ).toHaveValue('')
        expect(screen.getByPlaceholderText('Add note...')).toBeInTheDocument()
    })

    it('sends correct action payload on blur after editing', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { user } = render(
            <OrderNote
                note=""
                integrationId={1}
                orderId={123}
                ticketId="456"
            />,
        )

        const textarea = screen.getByRole('textbox', { name: /order note/i })
        await user.click(textarea)
        await user.type(textarea, 'New note')
        await user.tab()

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_name).toBe('shopifyEditNoteOfOrder')
            expect(body.payload.note).toBe('New note')
            expect(body.payload.order_id).toBe(123)
            expect(body.integration_id).toBe(1)
            expect(body.ticket_id).toBe(456)
        })
    })

    it('does not send action when note has not changed', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const requestSpy = vi.fn()
        server.events.on('request:start', ({ request }) => {
            if (request.url.includes('/api/actions/execute')) {
                requestSpy()
            }
        })

        const { user } = render(
            <OrderNote note="Existing note" integrationId={1} orderId={123} />,
        )

        const textarea = screen.getByRole('textbox', { name: /order note/i })
        await user.click(textarea)
        await user.tab()

        await waitFor(() => {
            expect(requestSpy).not.toHaveBeenCalled()
        })

        server.events.removeAllListeners()
    })

    it('renders as read-only text when readOnly is true', () => {
        render(
            <OrderNote
                note="Handle with care"
                integrationId={1}
                orderId={123}
                readOnly
            />,
        )

        expect(
            screen.queryByRole('textbox', { name: /order note/i }),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Handle with care')).toBeInTheDocument()
    })

    it('renders dash when readOnly and note is empty', () => {
        render(<OrderNote note="" integrationId={1} orderId={123} readOnly />)

        expect(screen.getByText('-')).toBeInTheDocument()
    })
})
