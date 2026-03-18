import { screen, waitFor } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import { IntentsFeedback } from '../IntentsFeedback'

const INTENTS: Record<string, string> = {
    billing_issue: 'Customer has a billing issue',
    shipping_inquiry: 'Customer asking about shipping',
    return_request: 'Customer wants to return an item',
    product_question: 'Customer has a product question',
}

beforeEach(() => {
    ;(
        window as unknown as {
            GORGIAS_CONSTANTS: { INTENTS: Record<string, string> }
        }
    ).GORGIAS_CONSTANTS = { INTENTS }
})

afterEach(() => {
    delete (
        window as unknown as {
            GORGIAS_CONSTANTS?: unknown
        }
    ).GORGIAS_CONSTANTS
})

const baseMessage = mockTicketMessage({
    id: 1,
    ticket_id: 10,
    intents: [],
})

describe('IntentsFeedback', () => {
    it('renders trigger button', () => {
        render(<IntentsFeedback message={baseMessage} />)

        expect(
            screen.getByRole('button', { name: 'Message intent' }),
        ).toBeInTheDocument()
    })

    it('opens the intents panel on click', async () => {
        const { user } = render(<IntentsFeedback message={baseMessage} />)

        await user.click(screen.getByRole('button', { name: 'Message intent' }))

        expect(screen.getByText('Message intents')).toBeInTheDocument()
    })

    it('shows "No intents detected" when message has no active intents', async () => {
        const { user } = render(<IntentsFeedback message={baseMessage} />)

        await user.click(screen.getByRole('button', { name: 'Message intent' }))

        expect(screen.getByText('No intents detected')).toBeInTheDocument()
    })

    it('shows active intents from the message', async () => {
        const message = mockTicketMessage({
            ...baseMessage,
            intents: [
                {
                    name: 'billing_issue',
                    rejected: false,
                    is_user_feedback: false,
                },
            ],
        })
        const { user } = render(<IntentsFeedback message={message} />)

        await user.click(screen.getByRole('button', { name: 'Message intent' }))

        expect(screen.getByText('Billing issue')).toBeInTheDocument()
    })

    it('can remove an active intent', async () => {
        const message = mockTicketMessage({
            ...baseMessage,
            intents: [
                {
                    name: 'billing_issue',
                    rejected: false,
                    is_user_feedback: false,
                },
            ],
        })
        const { user } = render(<IntentsFeedback message={message} />)

        await user.click(screen.getByRole('button', { name: 'Message intent' }))
        await user.click(
            screen.getByRole('button', { name: 'Remove billing_issue' }),
        )

        await waitFor(() => {
            expect(screen.getByText('No intents detected')).toBeInTheDocument()
        })
    })

    it('can add an available intent', async () => {
        const { user } = render(<IntentsFeedback message={baseMessage} />)

        await user.click(screen.getByRole('button', { name: 'Message intent' }))
        await user.click(
            screen.getByRole('button', { name: 'Add billing_issue' }),
        )

        await waitFor(() => {
            expect(screen.getByText('Billing issue')).toBeInTheDocument()
        })
    })

    it('disables adding when 3 intents are already active', async () => {
        const message = mockTicketMessage({
            ...baseMessage,
            intents: [
                {
                    name: 'billing_issue',
                    rejected: false,
                    is_user_feedback: false,
                },
                {
                    name: 'shipping_inquiry',
                    rejected: false,
                    is_user_feedback: false,
                },
                {
                    name: 'return_request',
                    rejected: false,
                    is_user_feedback: false,
                },
            ],
        })
        const { user } = render(<IntentsFeedback message={message} />)

        await user.click(screen.getByRole('button', { name: 'Message intent' }))

        expect(
            screen.getByRole('button', { name: 'Add product_question' }),
        ).toBeDisabled()
    })
})
