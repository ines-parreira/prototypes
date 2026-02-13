import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { CustomPlanBanner } from '../CustomPlanBanner'

describe('CustomPlanBanner', () => {
    it('should render the banner with correct message', () => {
        const mockCallback = jest.fn()

        render(
            <MemoryRouter>
                <CustomPlanBanner contactUsCallback={mockCallback} />
            </MemoryRouter>,
        )

        expect(screen.getByText('Contact us')).toBeInTheDocument()
    })

    it('should call contactUsCallback when "Contact us" is clicked', async () => {
        const user = userEvent.setup()
        const mockCallback = jest.fn()

        render(
            <MemoryRouter>
                <CustomPlanBanner contactUsCallback={mockCallback} />
            </MemoryRouter>,
        )

        const contactUsLink = screen.getByText('Contact us')
        await user.click(contactUsLink)

        expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should prevent default link behavior when clicked', async () => {
        const user = userEvent.setup()
        const mockCallback = jest.fn()

        render(
            <MemoryRouter>
                <CustomPlanBanner contactUsCallback={mockCallback} />
            </MemoryRouter>,
        )
        const contactUsLink = screen.getByText('Contact us')

        await user.click(contactUsLink)

        expect(contactUsLink.getAttribute('href')).toBe(null)
    })

    it('should render a closable banner', () => {
        const mockCallback = jest.fn()

        render(
            <MemoryRouter>
                <CustomPlanBanner contactUsCallback={mockCallback} />
            </MemoryRouter>,
        )

        const closeButton = screen.getByRole('button', { name: /close/i })
        expect(closeButton).toBeInTheDocument()
    })

    it('should remove banner when close button is clicked', async () => {
        const user = userEvent.setup()
        const mockCallback = jest.fn()

        render(
            <MemoryRouter>
                <CustomPlanBanner contactUsCallback={mockCallback} />
            </MemoryRouter>,
        )

        const closeButton = screen.getByRole('button', { name: /close/i })

        await act(async () => {
            await user.click(closeButton)
        })
        expect(
            screen.queryByText(
                "Because you're on a custom plan, please contact our team to make changes to your subscription.",
            ),
        ).not.toBeInTheDocument()
    })
})
