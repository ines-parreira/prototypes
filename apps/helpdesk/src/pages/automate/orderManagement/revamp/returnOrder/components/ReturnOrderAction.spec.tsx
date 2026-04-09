import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import type { ReturnAction } from 'models/selfServiceConfiguration/types'

import { ReturnOrderAction } from './ReturnOrderAction'

const mockUseLoopReturnsIntegrations = jest.fn()

jest.mock('../hooks/useLoopReturnsIntegrations', () => ({
    useLoopReturnsIntegrations: () => mockUseLoopReturnsIntegrations(),
}))

jest.mock('./LoopReturnsIntegrationCreateModal', () => ({
    LoopReturnsIntegrationCreateModal: ({
        isOpen,
        onCreate,
    }: {
        isOpen: boolean
        onClose: () => void
        onCreate: () => void
    }) =>
        isOpen ? (
            <div>
                <span>CreateModal</span>
                <button onClick={onCreate}>Confirm create</button>
            </div>
        ) : null,
}))

jest.mock('./ReturnOrderAutomatedResponseAction', () => ({
    ReturnOrderAutomatedResponseAction: ({
        responseMessageContent,
        onChange,
    }: {
        responseMessageContent: { text: string }
        onChange: (content: { html: string; text: string }) => void
    }) => (
        <div>
            <span>Response text editor: {responseMessageContent.text}</span>
            <button onClick={() => onChange({ html: 'new', text: 'new' })}>
                Edit response
            </button>
        </div>
    ),
}))

describe('ReturnOrderAction', () => {
    const mockOnChange = jest.fn()

    const automatedResponseAction: ReturnAction = {
        type: ReturnActionType.AutomatedResponse,
        responseMessageContent: { html: '<p>test</p>', text: 'test' },
    }

    const loopReturnsAction: ReturnAction = {
        type: ReturnActionType.LoopReturns,
        integrationId: 123,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseLoopReturnsIntegrations.mockReturnValue([])
    })

    it('should render section title and return method select', () => {
        render(
            <ReturnOrderAction
                action={automatedResponseAction}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('Return method')).toBeInTheDocument()
        expect(
            screen.getAllByLabelText('Return method').length,
        ).toBeGreaterThan(0)
    })

    it('should show automated response section when automated response is selected', () => {
        render(
            <ReturnOrderAction
                action={automatedResponseAction}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.getByText('Response text editor: test'),
        ).toBeInTheDocument()
    })

    it('should show loop returns info when loop returns is selected', () => {
        render(
            <ReturnOrderAction
                action={loopReturnsAction}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.getByText(
                'When a customer clicks Return, the selected portal will automatically open in a new tab.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/Response text editor/),
        ).not.toBeInTheDocument()
    })

    it('should not show loop returns caption when automated response is selected', () => {
        render(
            <ReturnOrderAction
                action={automatedResponseAction}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.queryByText(
                'When a customer clicks Return, the selected portal will automatically open in a new tab.',
            ),
        ).not.toBeInTheDocument()
    })

    it('should include loop returns integrations in the options', () => {
        mockUseLoopReturnsIntegrations.mockReturnValue([
            { id: 123, name: 'My Loop Returns', http: {} },
        ])

        render(
            <ReturnOrderAction
                action={loopReturnsAction}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('My Loop Returns')).toBeInTheDocument()
    })

    it('should call onChange when automated response content changes', async () => {
        const user = userEvent.setup()

        render(
            <ReturnOrderAction
                action={automatedResponseAction}
                onChange={mockOnChange}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Edit response' }))

        expect(mockOnChange).toHaveBeenCalledWith({
            ...automatedResponseAction,
            responseMessageContent: { html: 'new', text: 'new' },
        })
    })

    it('should render create loop returns option in select', () => {
        render(
            <ReturnOrderAction
                action={automatedResponseAction}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.getByText('Create new Loop Returns integration'),
        ).toBeInTheDocument()
    })

    it('should show automated response option in select', () => {
        render(
            <ReturnOrderAction
                action={loopReturnsAction}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('Automated response')).toBeInTheDocument()
    })

    it('should render multiple loop returns integrations', () => {
        mockUseLoopReturnsIntegrations.mockReturnValue([
            { id: 1, name: 'Portal A', http: {} },
            { id: 2, name: 'Portal B', http: {} },
        ])

        render(
            <ReturnOrderAction
                action={automatedResponseAction}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('Portal A')).toBeInTheDocument()
        expect(screen.getByText('Portal B')).toBeInTheDocument()
    })

    it('should not render create modal initially', () => {
        render(
            <ReturnOrderAction
                action={automatedResponseAction}
                onChange={mockOnChange}
            />,
        )

        expect(screen.queryByText('CreateModal')).not.toBeInTheDocument()
    })

    it('should not show automated response editor when loop returns is selected', () => {
        render(
            <ReturnOrderAction
                action={loopReturnsAction}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.queryByText(/Response text editor/),
        ).not.toBeInTheDocument()
    })
})
