import { render, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'

import CustomBusinessHoursIntegrationCell from '../CustomBusinessHoursIntegrationCell'

describe('CustomBusinessHoursIntegrationCell', () => {
    it('renders the integration name, icon type and address', () => {
        const props = {
            name: 'Test Integration',
            address: '+1 000-000-0000',
            type: IntegrationType.Phone,
        }

        render(<CustomBusinessHoursIntegrationCell {...props} />)

        expect(screen.getByText('Test Integration')).toBeInTheDocument()
        expect(screen.getByText('+1 000-000-0000')).toBeInTheDocument()
        expect(screen.getByText('phone')).toBeInTheDocument()
    })
})
