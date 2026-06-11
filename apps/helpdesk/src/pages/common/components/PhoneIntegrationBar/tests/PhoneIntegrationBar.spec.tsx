import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { PhoneIntegrationBar } from '../PhoneIntegrationBar'

jest.mock('../PhoneIntegrationCallBar', () => ({
    PhoneIntegrationCallBar: jest.fn(() => <div>PhoneIntegrationCallBar</div>),
}))
jest.mock('../WrapUpCallBar', () => ({
    WrapUpCallBar: jest.fn(() => <div>WrapUpCallBar</div>),
}))

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
