import { screen } from '@testing-library/react'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import EditCustomBusinessHoursForm from '../EditCustomBusinessHoursForm'

describe('EditCustomBusinessHoursForm', () => {
    it('renders the form with all sections and action buttons', () => {
        renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursForm />,
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
            <EditCustomBusinessHoursForm />,
            {},
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Timezone')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Add time range' }),
        ).toBeInTheDocument()
    })
})
