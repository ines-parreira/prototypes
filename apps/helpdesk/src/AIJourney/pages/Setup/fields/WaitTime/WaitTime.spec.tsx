import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { WaitTimeField } from './WaitTime'

describe('WaitTimeField', () => {
    describe('rendering', () => {
        it('should render with default title and description', () => {
            render(<WaitTimeField />)

            expect(
                screen.getByText('Wait time before triggering flow'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Time in minutes to wait before sending the first message',
                ),
            ).toBeInTheDocument()
        })

        it('should render with custom title when provided', () => {
            render(<WaitTimeField title="Custom Wait Time" />)

            expect(screen.getByText('Custom Wait Time')).toBeInTheDocument()
        })

        it('should render with custom description when provided', () => {
            render(
                <WaitTimeField description="Custom description for wait time" />,
            )

            expect(
                screen.getByText('Custom description for wait time'),
            ).toBeInTheDocument()
        })

        it('should render with both custom title and description', () => {
            render(
                <WaitTimeField
                    title="Post Purchase Wait"
                    description="Time to wait after order is placed"
                />,
            )

            expect(screen.getByText('Post Purchase Wait')).toBeInTheDocument()
            expect(
                screen.getByText('Time to wait after order is placed'),
            ).toBeInTheDocument()
        })

        it('should render with default title when only description is provided', () => {
            render(<WaitTimeField description="Custom description" />)

            expect(
                screen.getByText('Wait time before triggering flow'),
            ).toBeInTheDocument()
            expect(screen.getByText('Custom description')).toBeInTheDocument()
        })
    })

    describe('user interactions', () => {
        it('should call onChange when value changes', async () => {
            const handleChange = jest.fn()
            render(<WaitTimeField value={100} onChange={handleChange} />)

            const input = screen.getByRole('spinbutton')

            await act(async () => {
                await userEvent.clear(input)
                await userEvent.type(input, '200')
            })

            expect(handleChange).toHaveBeenCalled()
        })

        it('should call onValidationChange with false when value exceeds maximum', async () => {
            const handleValidationChange = jest.fn()
            render(
                <WaitTimeField
                    value={100}
                    onValidationChange={handleValidationChange}
                />,
            )

            const input = screen.getByRole('spinbutton')

            await act(async () => {
                await userEvent.clear(input)
                await userEvent.type(input, '20000')
            })

            expect(handleValidationChange).toHaveBeenCalledWith(false)
        })
    })

    describe('disabled state', () => {
        it('should render in disabled state', () => {
            render(<WaitTimeField isDisabled={true} />)

            const input = screen.getByRole('spinbutton')
            expect(input).toBeDisabled()
        })
    })
})
