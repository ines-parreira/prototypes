import { render, screen } from '@testing-library/react'

import { Form } from 'core/forms'

import AddCustomBusinessHoursModalGeneralSection from '../AddCustomBusinessHoursModalGeneralSection'

describe('AddCustomBusinessHoursModalGeneralSection', () => {
    it('should render all fields', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <AddCustomBusinessHoursModalGeneralSection />
            </Form>,
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Timezone')).toBeInTheDocument()
        expect(screen.getByText('Add time range')).toBeInTheDocument()
    })
})
