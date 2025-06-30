import { fireEvent, render, screen } from '@testing-library/react'

import { Form } from 'core/forms'

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
})
