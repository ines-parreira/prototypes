import { render, screen } from '@testing-library/react'

import PhoneIntegrationBar from '../PhoneIntegrationBar'

jest.mock('../PhoneIntegrationCallBar', () =>
    jest.fn(() => <div>PhoneIntegrationCallBar</div>),
)
jest.mock('../WrapUpCallBar', () => jest.fn(() => <div>WrapUpCallBar</div>))

describe('PhoneIntegrationBar', () => {
    const renderComponent = () => {
        return render(<PhoneIntegrationBar />)
    }

    it('should render PhoneIntegrationCallBar and WrapUpCallBar components', () => {
        renderComponent()

        expect(screen.getByText('PhoneIntegrationCallBar')).toBeInTheDocument()
        expect(screen.getByText('WrapUpCallBar')).toBeInTheDocument()
    })
})
