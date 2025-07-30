import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Form, FormField } from 'core/forms'

import TimeScheduleRow from '../TimeScheduleRow'

const props = {
    index: 0,
    name: 'business_hours_config.business_hours',
    onRemove: jest.fn(),
    isRemovable: true,
}

const defaultFormValues = {
    business_hours_config: {
        business_hours: [
            {
                days: '1',
                from_time: '09:00',
                to_time: '17:00',
            },
        ],
    },
}

describe('TimeScheduleRow', () => {
    it('should render all fields and remove button', () => {
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        expect(screen.getByText('Monday')).toBeInTheDocument()
        expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('17:00')).toBeInTheDocument()
        expect(screen.getByText('to')).toBeInTheDocument()
        expect(screen.getByText('close')).toBeInTheDocument()
    })

    it('should not render remove button if isRemovable is false', () => {
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleRow {...props} isRemovable={false} />
            </Form>,
        )

        expect(screen.queryByText('close')).not.toBeInTheDocument()
    })

    it('should call onRemove when remove button is clicked', () => {
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        fireEvent.click(screen.getByText('close'))

        expect(props.onRemove).toHaveBeenCalledWith(0)
    })

    it('should select days correctly', () => {
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        fireEvent.click(screen.getByText('Monday'))
        fireEvent.click(screen.getByText('Tuesday'))

        expect(screen.queryByText('Monday')).not.toBeInTheDocument()
        expect(screen.getByText('Tuesday')).toBeInTheDocument()
    })

    it('should show error message if to time is less than from time', async () => {
        const { type } = userEvent.setup()
        render(
            <Form
                onValidSubmit={jest.fn()}
                defaultValues={{
                    business_hours_config: {
                        business_hours: [
                            {
                                days: '1',
                                from_time: '09:00',
                                to_time: '07:00',
                            },
                        ],
                    },
                }}
            >
                <TimeScheduleRow {...props} />
                <FormField name="someField" type="checkbox" />
            </Form>,
        )

        expect(
            screen.getByText('To time must be greater than From time'),
        ).toBeInTheDocument()

        await act(async () => {
            const input: HTMLInputElement = screen.getByDisplayValue('07:00')
            await type(input, '10:00', {
                initialSelectionStart: 0,
                initialSelectionEnd: input.value.length,
            })
        })

        await waitFor(() => {
            expect(
                screen.queryByText('To time must be greater than From time'),
            ).not.toBeInTheDocument()
        })
    })
})
