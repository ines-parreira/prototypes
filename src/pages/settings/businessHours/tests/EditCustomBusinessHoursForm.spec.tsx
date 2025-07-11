import { screen } from '@testing-library/react'

import { mockBusinessHoursDetails } from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import EditCustomBusinessHoursForm from '../EditCustomBusinessHoursForm'

const businessHours = mockBusinessHoursDetails({
    business_hours_config: {
        timezone: 'America/New_York',
        business_hours: [
            {
                days: '3',
                from_time: '09:00',
                to_time: '17:00',
            },
            {
                days: '4',
                from_time: '10:00',
                to_time: '18:00',
            },
        ],
    },
})

describe('EditCustomBusinessHoursForm', () => {
    it('renders the form with all sections and action buttons', () => {
        renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursForm businessHours={businessHours} />,
            {},
        )

        expect(screen.getByText('General')).toBeInTheDocument()
        expect(screen.getByText('Schedule')).toBeInTheDocument()
        expect(screen.getByText('Integrations')).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Save changes' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete business hours' }),
        ).toBeInTheDocument()
    })

    it('renders the form with all fields', () => {
        renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursForm businessHours={businessHours} />,
            {},
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Timezone')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Add time range' }),
        ).toBeInTheDocument()
    })

    it('should pre-populate the form with the business hours details', () => {
        renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursForm businessHours={businessHours} />,
            {},
        )

        expect(screen.getByLabelText(/Name/)).toHaveValue(businessHours.name)
        expect(screen.getByText('America/New_York')).toBeInTheDocument()
        expect(screen.getByText('Wednesday')).toBeInTheDocument()
        expect(screen.getByText('Thursday')).toBeInTheDocument()
        expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('17:00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('10:00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('18:00')).toBeInTheDocument()
    })
})
