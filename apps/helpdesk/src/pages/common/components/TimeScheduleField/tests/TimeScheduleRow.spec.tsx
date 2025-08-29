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

const alwaysOnFormValues = {
    business_hours_config: {
        business_hours: [
            {
                days: '1,2,3,4,5,6,7',
                from_time: '00:00',
                to_time: '00:00',
            },
        ],
    },
}

describe('TimeScheduleRow', () => {
    it('should render all fields and remove button', async () => {
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

        expect(
            screen.queryByRole('button', { name: /close/i }),
        ).not.toBeInTheDocument()
    })

    it('should call onRemove when remove button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        await act(async () => {
            await user.click(screen.getByText('close'))
        })

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
    })

    it('should hide time inputs when "Always On" is selected', async () => {
        const user = userEvent.setup()
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        await act(async () => {
            const dropdown = screen.getByRole('combobox')
            await user.click(dropdown)
        })

        await waitFor(async () => {
            const alwaysOnOption = screen.getByText('24/7 (always on)')
            await user.click(alwaysOnOption)
        })

        await waitFor(() => {
            expect(
                screen.queryByText('To time must be greater than From time'),
            ).not.toBeInTheDocument()
        })
    })

    it('should allow 00:00 as to time even with late from time', () => {
        render(
            <Form
                onValidSubmit={jest.fn()}
                defaultValues={{
                    business_hours_config: {
                        business_hours: [
                            {
                                days: '1',
                                from_time: '23:30',
                                to_time: '00:00',
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
            screen.queryByText('To time must be greater than From time'),
        ).not.toBeInTheDocument()
    })

    it('should show time inputs when switching from "Always On" to regular schedule', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <Form onValidSubmit={jest.fn()} defaultValues={alwaysOnFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        // Initially time inputs should be hidden
        expect(
            container.querySelector(
                `input[name="business_hours_config.business_hours.0.from_time"]`,
            ),
        ).toBeDisabled()
        expect(
            container.querySelector(
                `input[name="business_hours_config.business_hours.0.to_time"]`,
            ),
        ).toBeDisabled()

        await act(async () => {
            const dropdown = screen.getByRole('combobox')
            await user.click(dropdown)
        })

        await waitFor(async () => {
            const everydayOption = screen.getByText('Everyday')
            await user.click(everydayOption)
        })

        await waitFor(() => {
            expect(screen.getByDisplayValue('00:00')).toBeInTheDocument()
            expect(screen.getByDisplayValue('23:59')).toBeInTheDocument()
            expect(screen.getByText('to')).toBeInTheDocument()
        })
    })

    it('should display "Everyday" when times are not 00:00', () => {
        const everydayFormValues = {
            business_hours_config: {
                business_hours: [
                    {
                        days: '1,2,3,4,5,6,7',
                        from_time: '09:00',
                        to_time: '17:00',
                    },
                ],
            },
        }

        render(
            <Form onValidSubmit={jest.fn()} defaultValues={everydayFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        expect(screen.getByText('Everyday')).toBeInTheDocument()
    })

    it('should disable time inputs when "Always On" is selected', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        await act(async () => {
            const dropdown = screen.getByRole('combobox')
            await user.click(dropdown)
        })

        await waitFor(async () => {
            const alwaysOnOption = screen.getByText('24/7 (always on)')
            await user.click(alwaysOnOption)
        })

        await waitFor(() => {
            const fromTimeInput = container.querySelector(
                `input[name="business_hours_config.business_hours.0.from_time"]`,
            )
            const toTimeInput = container.querySelector(
                `input[name="business_hours_config.business_hours.0.to_time"]`,
            )

            expect(fromTimeInput).toBeDisabled()
            expect(toTimeInput).toBeDisabled()
        })
    })

    it('should enable time inputs when switching from "Always On" to regular schedule', async () => {
        const user = userEvent.setup()
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={alwaysOnFormValues}>
                <TimeScheduleRow {...props} />
            </Form>,
        )

        await act(async () => {
            const dropdown = screen.getByRole('combobox')
            await user.click(dropdown)
        })

        await waitFor(async () => {
            const everydayOption = screen.getByText('Everyday')
            await user.click(everydayOption)
        })

        await waitFor(() => {
            expect(screen.getByDisplayValue('00:00')).not.toBeDisabled()
            expect(screen.getByDisplayValue('23:59')).not.toBeDisabled()
        })
    })
})
