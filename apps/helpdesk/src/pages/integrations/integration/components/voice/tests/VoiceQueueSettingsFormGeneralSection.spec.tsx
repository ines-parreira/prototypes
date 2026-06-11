import { Form, FormSubmitButton } from '@repo/forms'
import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { VoiceQueueSettingsFormGeneralSection } from '../VoiceQueueSettingsFormGeneralSection'

describe('VoiceQueueSettingsFormGeneralSection', () => {
    const renderComponent = ({
        defaultValues = {},
        onValidSubmit = jest.fn(),
    }: {
        defaultValues?: Record<string, unknown>
        onValidSubmit?: jest.Mock
    } = {}) => {
        const user = userEvent.setup()

        render(
            <Form
                defaultValues={{
                    name: 'My Queue',
                    capacity: 100,
                    priority_weight: 100,
                    ...defaultValues,
                }}
                onValidSubmit={onValidSubmit}
            >
                <VoiceQueueSettingsFormGeneralSection />
                <FormSubmitButton>Submit</FormSubmitButton>
            </Form>,
        )

        return { user, onValidSubmit }
    }

    it('should render the general section content', () => {
        renderComponent()

        expect(screen.getByText('Queue name')).toBeInTheDocument()
        expect(screen.getByText('Queue capacity')).toBeInTheDocument()
        expect(screen.getByText('Priority queue')).toBeInTheDocument()
    })

    describe('Queue capacity field', () => {
        it('should submit a numeric capacity when a value is entered', async () => {
            const { user, onValidSubmit } = renderComponent()

            const capacityInput = screen.getByLabelText('Queue capacity')
            await user.clear(capacityInput)
            await user.type(capacityInput, '150')
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({ capacity: 150 }),
                    expect.anything(),
                )
            })
        })

        it('should submit null capacity when the value is cleared', async () => {
            const { user, onValidSubmit } = renderComponent()

            const capacityInput = screen.getByLabelText('Queue capacity')
            await user.clear(capacityInput)
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({ capacity: null }),
                    expect.anything(),
                )
            })
        })
    })

    describe('Priority weight field', () => {
        it('should render the priority toggle as off when priority_weight is the max value', () => {
            renderComponent({ defaultValues: { priority_weight: 100 } })

            expect(screen.getByRole('switch')).not.toBeChecked()
        })

        it('should render the priority toggle as on when priority_weight is not the max value', () => {
            renderComponent({ defaultValues: { priority_weight: 1 } })

            expect(screen.getByRole('switch')).toBeChecked()
        })

        it('should submit the min priority weight when the toggle is turned on', async () => {
            const { user, onValidSubmit } = renderComponent({
                defaultValues: { priority_weight: 100 },
            })

            await user.click(screen.getByRole('switch'))
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({ priority_weight: 1 }),
                    expect.anything(),
                )
            })
        })

        it('should submit the max priority weight when the toggle is turned off', async () => {
            const { user, onValidSubmit } = renderComponent({
                defaultValues: { priority_weight: 1 },
            })

            await user.click(screen.getByRole('switch'))
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({ priority_weight: 100 }),
                    expect.anything(),
                )
            })
        })
    })
})
