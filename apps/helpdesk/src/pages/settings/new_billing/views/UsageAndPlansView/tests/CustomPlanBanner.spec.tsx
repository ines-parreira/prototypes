import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CustomPlanBanner, GatedCancellationBanner } from '../CustomPlanBanner'

describe('CustomPlanBanner', () => {
    it('should render the banner with correct message', () => {
        const mockCallback = jest.fn()

        render(<CustomPlanBanner contactUsCallback={mockCallback} />)

        expect(
            screen.getByText(/Because you.re on a custom plan, please/),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Contact us' }),
        ).toBeInTheDocument()
    })

    it('should call contactUsCallback when "Contact us" is clicked', async () => {
        const user = userEvent.setup()
        const mockCallback = jest.fn()

        render(<CustomPlanBanner contactUsCallback={mockCallback} />)

        await user.click(screen.getByRole('link', { name: 'Contact us' }))

        expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should prevent default link behavior when clicked', async () => {
        const user = userEvent.setup()
        const mockCallback = jest.fn()

        render(<CustomPlanBanner contactUsCallback={mockCallback} />)

        const contactUsLink = screen.getByRole('link', { name: 'Contact us' })
        await user.click(contactUsLink)

        // contactUsCallback is called instead of navigating away
        expect(mockCallback).toHaveBeenCalledTimes(1)
        // link uses a local anchor, not an external URL
        expect(contactUsLink).not.toHaveAttribute(
            'href',
            expect.stringMatching(/^https?:\/\//),
        )
    })

    it('should render a closable banner', () => {
        const mockCallback = jest.fn()

        render(<CustomPlanBanner contactUsCallback={mockCallback} />)

        expect(
            screen.getByRole('button', { name: /close/i }),
        ).toBeInTheDocument()
    })

    it('should remove banner when close button is clicked', async () => {
        const user = userEvent.setup()
        const mockCallback = jest.fn()

        render(<CustomPlanBanner contactUsCallback={mockCallback} />)

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /close/i }))
        })

        expect(
            screen.queryByText(/Because you.re on a custom plan, please/),
        ).not.toBeInTheDocument()
    })
})

describe('GatedCancellationBanner', () => {
    it('should render the gated cancellation banner with correct message', () => {
        const mockCallback = jest.fn()

        render(<GatedCancellationBanner contactUsCallback={mockCallback} />)

        expect(
            screen.getByText(
                /Your account is on a managed plan. To cancel products on your account/i,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'subscription term' }),
        ).toHaveAttribute(
            'href',
            'https://www.gorgias.com/legal/master-subscription-agreement',
        )
        expect(
            screen.getByRole('button', { name: 'Contact us' }),
        ).toBeInTheDocument()
    })

    it('should call contactUsCallback when "Contact us" is clicked', async () => {
        const user = userEvent.setup()
        const mockCallback = jest.fn()

        render(<GatedCancellationBanner contactUsCallback={mockCallback} />)

        await user.click(screen.getByRole('button', { name: 'Contact us' }))

        expect(mockCallback).toHaveBeenCalledTimes(1)
    })
})
