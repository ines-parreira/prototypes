import { screen } from '@testing-library/react'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import EditCustomBusinessHoursPage from '../EditCustomBusinessHoursPage'

jest.mock('../EditCustomBusinessHoursForm', () => () => (
    <div>EditCustomBusinessHoursForm</div>
))

describe('EditCustomBusinessHoursPage', () => {
    it('renders the page with breadcrumbs and form', () => {
        renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursPage />,
            {},
        )

        expect(screen.getByText('Business hours')).toBeInTheDocument()

        expect(
            screen.getByText('Edit custom business hours'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('EditCustomBusinessHoursForm'),
        ).toBeInTheDocument()
    })
})
