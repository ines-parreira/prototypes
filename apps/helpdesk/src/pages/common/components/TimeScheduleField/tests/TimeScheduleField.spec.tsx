import { Form } from '@repo/forms'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { DEFAULT_BUSINESS_HOURS_SCHEDULE } from 'pages/settings/businessHours/constants'

import TimeScheduleField from '../TimeScheduleField'

const defaultFormValues = {
    business_hours_config: {
        business_hours: [
            {
                days: '1',
                from_time: '09:00',
                to_time: '17:00',
            },
            {
                days: '2',
                from_time: '09:00',
                to_time: '17:00',
            },
        ],
    },
}

describe('TimeScheduleField', () => {
    it('should render add button', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <TimeScheduleField name="business_hours_config.business_hours" />
            </Form>,
        )

        expect(screen.getByText('Add time range')).toBeInTheDocument()
    })

    it('should add new row when add button is clicked', async () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <TimeScheduleField name="business_hours_config.business_hours" />
            </Form>,
        )

        fireEvent.click(screen.getByText('Add time range'))

        await waitFor(() => {
            expect(
                screen.getAllByDisplayValue(
                    DEFAULT_BUSINESS_HOURS_SCHEDULE.from_time,
                ),
            ).toHaveLength(1)
        })
    })

    it('should render TimeScheduleRow and remove button for each row', () => {
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleField name="business_hours_config.business_hours" />
            </Form>,
        )

        expect(screen.getAllByDisplayValue('09:00')).toHaveLength(2)
        expect(screen.getAllByDisplayValue('17:00')).toHaveLength(2)
        expect(screen.getAllByText('close')).toHaveLength(2)
    })

    it('should show empty state message when no fields exist', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <TimeScheduleField name="business_hours_config.business_hours" />
            </Form>,
        )

        expect(
            screen.getByText(
                'You are currently outside business hours. Add one or multiple time ranges to create your custom schedule.',
            ),
        ).toBeInTheDocument()
    })

    it('should show remove buttons when isRemovable is true', () => {
        render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultFormValues}>
                <TimeScheduleField
                    name="business_hours_config.business_hours"
                    isRemovable={true}
                />
            </Form>,
        )

        expect(screen.getAllByText('close')).toHaveLength(2)
    })

    it('should not show remove button for single row when isRemovable is false', async () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <TimeScheduleField
                    name="business_hours_config.business_hours"
                    isRemovable={false}
                />
            </Form>,
        )

        fireEvent.click(screen.getByText('Add time range'))

        await waitFor(() => {
            expect(screen.queryByText('close')).not.toBeInTheDocument()
        })
    })

    it('should not show caption when withCaption is false', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <TimeScheduleField
                    name="business_hours_config.business_hours"
                    withCaption={false}
                />
            </Form>,
        )

        expect(
            screen.queryByText(
                'Add one or multiple time ranges to create your custom schedule.',
            ),
        ).not.toBeInTheDocument()
    })
})
