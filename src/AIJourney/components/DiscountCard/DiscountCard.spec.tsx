import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { DiscountCard } from './DiscountCard'

const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockPush,
    }),
    useParams: () => ({
        shopName: 'test-store',
    }),
}))

describe('<DiscountCard />', () => {
    it('renders the title, icon, and description', () => {
        render(<DiscountCard />)
        expect(screen.getByText('Immediate win')).toBeInTheDocument()
        expect(screen.getByAltText('sphere-icon')).toBeInTheDocument()
        expect(
            screen.getByText(/Enable the Discount Codes to boost conversion/i),
        ).toBeInTheDocument()
    })

    it('redirects to conversation-setup when button is clicked', async () => {
        render(<DiscountCard />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-journey/test-store/conversation-setup',
        )
    })
})
