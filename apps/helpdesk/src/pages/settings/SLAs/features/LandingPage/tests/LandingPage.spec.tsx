import { render } from '@repo/testing'

import { LandingPage } from '../LandingPage'

const mockLandingBanner = 'MockLandingBanner'

jest.mock('../LandingBanner', () => ({
    LandingBanner: jest.fn(() => <div>{mockLandingBanner}</div>),
}))

describe('<LandingPage />', () => {
    it('should display the landing page', () => {
        const { getAllByText, getByText } = render(<LandingPage />)

        expect(getAllByText(/Create SLA/i)).toHaveLength(2)
        expect(getByText(/Create from template/i)).toBeInTheDocument()
        expect(getByText(mockLandingBanner)).toBeInTheDocument()
    })
})
