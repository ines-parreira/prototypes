import { Form } from '@repo/forms'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DEFAULT_BUSINESS_HOUR } from 'pages/settings/businessHours/constants'

import PrefilledTimeScheduleField from '../PrefilledTimeScheduleField'

const customDefaultValues = {
    days: '1,2,3,4,5,6,7',
    from_time: '08:00',
    to_time: '20:00',
}

const formWithExistingValues = {
    time_schedule: [
        {
            days: '1',
            from_time: '10:00',
            to_time: '18:00',
        },
        {
            days: '6,7',
            from_time: '11:00',
            to_time: '15:00',
        },
    ],
}

describe('PrefilledTimeScheduleField', () => {
    describe('Default behavior', () => {
        it('should automatically add default business hours when field is empty', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue(DEFAULT_BUSINESS_HOUR.from_time),
                ).toBeInTheDocument()
                expect(
                    screen.getByDisplayValue(DEFAULT_BUSINESS_HOUR.to_time),
                ).toBeInTheDocument()
                expect(screen.getByText('Mon-Fri')).toBeInTheDocument()
            })
        })

        it('should use custom default values when provided', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <PrefilledTimeScheduleField
                        name="time_schedule"
                        defaultValues={customDefaultValues}
                    />
                </Form>,
            )

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue(customDefaultValues.from_time),
                ).toBeInTheDocument()
                expect(
                    screen.getByDisplayValue(customDefaultValues.to_time),
                ).toBeInTheDocument()
                expect(screen.getByText('Everyday')).toBeInTheDocument()
            })
        })

        it('should not add default values when field already has values', () => {
            render(
                <Form
                    onValidSubmit={jest.fn()}
                    defaultValues={formWithExistingValues}
                >
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            expect(screen.getByDisplayValue('10:00')).toBeInTheDocument()
            expect(screen.getByDisplayValue('18:00')).toBeInTheDocument()
            expect(screen.getByDisplayValue('11:00')).toBeInTheDocument()
            expect(screen.getByDisplayValue('15:00')).toBeInTheDocument()
            expect(screen.getByText('Monday')).toBeInTheDocument()
            expect(screen.getByText('Weekend')).toBeInTheDocument()

            expect(
                screen.queryByDisplayValue(DEFAULT_BUSINESS_HOUR.from_time),
            ).not.toBeInTheDocument()
        })
    })

    describe('Add time range functionality', () => {
        it('should render add time range button', () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            expect(
                screen.getByRole('button', { name: /add time range/i }),
            ).toBeInTheDocument()
        })

        it('should add new row with default values when add button is clicked', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            await waitFor(() => {
                expect(screen.getAllByDisplayValue('09:00')).toHaveLength(1)
            })

            act(() => {
                userEvent.click(
                    screen.getByRole('button', { name: /add time range/i }),
                )
            })

            await waitFor(() => {
                expect(screen.getAllByDisplayValue('09:00')).toHaveLength(2)
                expect(screen.getAllByDisplayValue('17:00')).toHaveLength(2)
                expect(screen.getAllByText('Mon-Fri')).toHaveLength(2)
            })
        })

        it('should add new row with custom default values when provided', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <PrefilledTimeScheduleField
                        name="time_schedule"
                        defaultValues={customDefaultValues}
                    />
                </Form>,
            )

            await waitFor(() => {
                expect(screen.getAllByDisplayValue('08:00')).toHaveLength(1)
            })

            act(() => {
                userEvent.click(
                    screen.getByRole('button', { name: /add time range/i }),
                )
            })

            await waitFor(() => {
                expect(screen.getAllByDisplayValue('08:00')).toHaveLength(2)
                expect(screen.getAllByDisplayValue('20:00')).toHaveLength(2)
                expect(screen.getAllByText('Everyday')).toHaveLength(2)
            })
        })
    })

    describe('Remove functionality', () => {
        it('should show remove button when there are multiple rows', async () => {
            render(
                <Form
                    onValidSubmit={jest.fn()}
                    defaultValues={formWithExistingValues}
                >
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            const removeButtons = screen
                .getAllByRole('button')
                .filter(
                    (button) =>
                        button.className.includes('destructive') &&
                        button.className.includes('iconbutton'),
                )
            expect(removeButtons).toHaveLength(2)
        })

        it('should not show remove button when there is only one row', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            await waitFor(() => {
                expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
            })

            const removeButtons = screen
                .queryAllByRole('button')
                .filter(
                    (button) =>
                        button.className.includes('destructive') &&
                        button.className.includes('iconbutton'),
                )
            expect(removeButtons).toHaveLength(0)
        })

        it('should remove row when remove button is clicked', async () => {
            render(
                <Form
                    onValidSubmit={jest.fn()}
                    defaultValues={formWithExistingValues}
                >
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            const removeButtons = screen
                .getAllByRole('button')
                .filter(
                    (button) =>
                        button.className.includes('destructive') &&
                        button.className.includes('iconbutton'),
                )

            act(() => {
                userEvent.click(removeButtons[0])
            })

            await waitFor(() => {
                expect(
                    screen.queryByDisplayValue('10:00'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByDisplayValue('18:00'),
                ).not.toBeInTheDocument()
                expect(screen.getByDisplayValue('11:00')).toBeInTheDocument()
                expect(screen.getByDisplayValue('15:00')).toBeInTheDocument()
            })
        })

        it('should hide remove button when only one row remains after deletion', async () => {
            render(
                <Form
                    onValidSubmit={jest.fn()}
                    defaultValues={formWithExistingValues}
                >
                    <PrefilledTimeScheduleField name="time_schedule" />
                </Form>,
            )

            const removeButtons = screen
                .getAllByRole('button')
                .filter(
                    (button) =>
                        button.className.includes('destructive') &&
                        button.className.includes('iconbutton'),
                )

            act(() => {
                userEvent.click(removeButtons[0])
            })

            await waitFor(() => {
                const remainingRemoveButtons = screen
                    .queryAllByRole('button')
                    .filter(
                        (button) =>
                            button.className.includes('destructive') &&
                            button.className.includes('iconbutton'),
                    )
                expect(remainingRemoveButtons).toHaveLength(0)
            })
        })
    })

    describe('Props passing', () => {
        it('should pass root prop to TimeScheduleRow components', async () => {
            const rootElement = document.createElement('div')
            rootElement.id = 'test-root'
            document.body.appendChild(rootElement)

            const { container } = render(
                <Form onValidSubmit={jest.fn()}>
                    <PrefilledTimeScheduleField
                        name="time_schedule"
                        root={rootElement}
                    />
                </Form>,
            )

            await waitFor(() => {
                expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
            })

            expect(container.querySelector('.container')).toBeInTheDocument()

            document.body.removeChild(rootElement)
        })
    })
})
