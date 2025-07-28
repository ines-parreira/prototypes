import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { IntegrationType } from '../../../../models/integration/constants'
import ChannelFilter from './ChannelFilter'

describe('ChannelFilter', () => {
    const mockOnChange = jest.fn()
    const mockChannels = [IntegrationType.Email, IntegrationType.Facebook]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with "All Channels" by default', () => {
        render(
            <ChannelFilter channels={mockChannels} onChange={mockOnChange} />,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByText('All Channels')).toBeInTheDocument()
    })

    it('opens dropdown and selects the email channel', async () => {
        const user = userEvent.setup()

        render(
            <ChannelFilter channels={mockChannels} onChange={mockOnChange} />,
        )

        const button = screen.getByRole('button')

        await act(() => user.click(button))

        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(1)

        // Select first non-"All Channels" option
        const emailOption = options.find((option) =>
            option.textContent?.includes('Email'),
        )

        await act(() => user.click(emailOption!))

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith([
                IntegrationType.Email,
                IntegrationType.Gmail,
                IntegrationType.Outlook,
            ])
        })
    })

    it('opens dropdown and selects a generic channel', async () => {
        const user = userEvent.setup()

        render(
            <ChannelFilter channels={mockChannels} onChange={mockOnChange} />,
        )

        const button = screen.getByRole('button')

        await act(() => user.click(button))

        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(1)

        // Select first non-"All Channels" option
        const facebookOption = options.find((option) =>
            option.textContent?.includes('Facebook'),
        )

        await act(() => user.click(facebookOption!))

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith([
                IntegrationType.Facebook,
            ])
        })
    })

    it('selects "All Channels" option', async () => {
        const user = userEvent.setup()

        render(
            <ChannelFilter channels={mockChannels} onChange={mockOnChange} />,
        )

        const button = screen.getByRole('button')

        await act(() => user.click(button))

        const allChannelsOption = screen.getAllByText('All Channels')[1] // Get the dropdown option, not button text

        await act(() => user.click(allChannelsOption))

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith(null)
        })
    })

    it('displays search when withSearch is true', async () => {
        const user = userEvent.setup()

        render(
            <ChannelFilter
                channels={mockChannels}
                onChange={mockOnChange}
                withSearch
            />,
        )

        const button = screen.getByRole('button')

        await act(() => user.click(button))

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })
    })
})
