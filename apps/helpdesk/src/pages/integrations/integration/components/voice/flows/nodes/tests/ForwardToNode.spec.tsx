import { ComponentProps } from 'react'

import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    mockCallRoutingFlow,
    mockForwardToExternalNumberStep,
} from '@gorgias/helpdesk-mocks'
import { ForwardToExternalNumberStep } from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { ForwardToNode } from '../ForwardToNode'

const renderComponent = (
    mockStepData: Partial<ForwardToExternalNumberStep> = {},
) => {
    const mockStep = mockForwardToExternalNumberStep({
        external_number: '',
        ...mockStepData,
    })

    const mockFlow = mockCallRoutingFlow({
        first_step_id: mockStep.id,
        steps: { [mockStep.id]: mockStep },
    })
    const props = {
        data: mockStep,
    } as ComponentProps<typeof ForwardToNode>

    return renderWithQueryClientProvider(
        <FlowProvider>
            <Form defaultValues={mockFlow} onValidSubmit={jest.fn()}>
                <ForwardToNode {...props} />
            </Form>
        </FlowProvider>,
    )
}

describe('ForwardToNode', () => {
    describe('Rendering', () => {
        it('should render the node', () => {
            renderComponent()

            expect(screen.getAllByText('Forward to')).toHaveLength(2)
            expect(
                screen.getByText(
                    'Forwarding is a final step, you cannot add any other steps after.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('Phone number')).toBeInTheDocument()
            expect(screen.getByText('External Number')).toBeInTheDocument()
        })

        it('should render with phone number as description when provided', () => {
            renderComponent({ external_number: '+15551234567' })

            expect(screen.getByText('+15551234567')).toBeInTheDocument()
        })
    })

    describe('Phone Number Validation', () => {
        it('should show error when phone number is empty', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.hover(screen.getByText('warning_amber'))
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Phone number is required'),
                ).toBeInTheDocument()
            })
        })

        it('should show error for invalid phone number', async () => {
            const user = userEvent.setup()
            renderComponent({ external_number: '123' })

            await act(async () => {
                await user.hover(screen.getByText('warning_amber'))
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Invalid phone number'),
                ).toBeInTheDocument()
            })
        })

        it('should not show error for valid US phone number', async () => {
            renderComponent({ external_number: '+12125551234' })

            await waitFor(() => {
                expect(screen.queryByText('warning_amber')).toBeNull()
            })
        })

        it('should not show error for valid international phone number', async () => {
            renderComponent({ external_number: '+442071234567' })

            await waitFor(() => {
                expect(screen.queryByText('warning_amber')).toBeNull()
            })
        })
    })
})
