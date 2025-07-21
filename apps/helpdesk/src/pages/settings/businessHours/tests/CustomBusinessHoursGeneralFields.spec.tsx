import { render, screen } from '@testing-library/react'

import { Form } from 'core/forms'

import CustomBusinessHoursGeneralFields from '../CustomBusinessHoursGeneralFields'

describe('CustomBusinessHoursGeneralFields', () => {
    it('should render all fields', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <CustomBusinessHoursGeneralFields />
            </Form>,
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Timezone')).toBeInTheDocument()
    })
})
