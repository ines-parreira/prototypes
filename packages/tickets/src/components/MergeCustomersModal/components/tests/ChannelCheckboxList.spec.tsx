import { act, screen, waitFor } from '@testing-library/react'

import { mockTicketCustomerChannel } from '@gorgias/helpdesk-mocks'

import { render } from '../../../../tests/render.utils'
import { ChannelCheckboxList } from '../ChannelCheckboxList'

describe('ChannelCheckboxList', () => {
    const mockEmailChannel = mockTicketCustomerChannel({
        id: 1,
        type: 'email',
        address: 'test@example.com',
        preferred: false,
    })

    const mockPhoneChannel = mockTicketCustomerChannel({
        id: 2,
        type: 'phone',
        address: '+14155551234',
        preferred: false,
    })

    const mockSmsChannel = mockTicketCustomerChannel({
        id: 3,
        type: 'sms',
        address: '+14155555678',
        preferred: false,
    })

    const mockOnToggle = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render nothing when channels array is empty', () => {
        const { container } = render(
            <ChannelCheckboxList
                channels={[]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="Test Label"
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render channel with correct label and address', () => {
        render(
            <ChannelCheckboxList
                channels={[mockEmailChannel]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="Alternative email"
            />,
        )

        expect(screen.getByText('Alternative email')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should show channel as selected when in selectedChannels', () => {
        render(
            <ChannelCheckboxList
                channels={[mockEmailChannel]}
                selectedChannels={[mockEmailChannel]}
                onToggle={mockOnToggle}
                label="Alternative email"
            />,
        )

        const radio = screen.getByRole('radio')
        expect(radio).toBeChecked()
    })

    it('should show channel as unselected when not in selectedChannels', () => {
        render(
            <ChannelCheckboxList
                channels={[mockEmailChannel]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="Alternative email"
            />,
        )

        const radio = screen.getByRole('radio')
        expect(radio).not.toBeChecked()
    })

    it('should call onToggle with channel when clicked', async () => {
        const { user } = render(
            <ChannelCheckboxList
                channels={[mockEmailChannel]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="Alternative email"
            />,
        )

        await act(async () => {
            await user.click(screen.getByText('test@example.com'))
        })

        await waitFor(() => {
            expect(mockOnToggle).toHaveBeenCalledWith(mockEmailChannel)
            expect(mockOnToggle).toHaveBeenCalledTimes(1)
        })
    })

    it('should call onToggle when selected channel is clicked to unselect', async () => {
        const { user } = render(
            <ChannelCheckboxList
                channels={[mockEmailChannel]}
                selectedChannels={[mockEmailChannel]}
                onToggle={mockOnToggle}
                label="Alternative email"
            />,
        )

        await act(async () => {
            await user.click(screen.getByText('test@example.com'))
        })

        await waitFor(() => {
            expect(mockOnToggle).toHaveBeenCalledWith(mockEmailChannel)
        })
    })

    it('should disable channel when address matches disabledChannelAddresses', () => {
        render(
            <ChannelCheckboxList
                channels={[mockEmailChannel]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="Alternative email"
                disabledChannelAddresses={new Set(['test@example.com'])}
            />,
        )

        const radio = screen.getByRole('radio')
        expect(radio).toBeDisabled()
    })

    it('should not call onToggle when disabled channel is clicked', async () => {
        const { user } = render(
            <ChannelCheckboxList
                channels={[mockEmailChannel]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="Alternative email"
                disabledChannelAddresses={new Set(['test@example.com'])}
            />,
        )

        await act(async () => {
            await user.click(screen.getByText('test@example.com'))
        })

        await waitFor(() => {
            expect(mockOnToggle).not.toHaveBeenCalled()
        })
    })

    it('should format phone numbers internationally', () => {
        render(
            <ChannelCheckboxList
                channels={[mockPhoneChannel]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="Phone"
            />,
        )

        expect(screen.getByText('+1 415 555 1234')).toBeInTheDocument()
    })

    it('should format SMS numbers internationally', () => {
        render(
            <ChannelCheckboxList
                channels={[mockSmsChannel]}
                selectedChannels={[]}
                onToggle={mockOnToggle}
                label="SMS"
            />,
        )

        expect(screen.getByText('+1 415 555 5678')).toBeInTheDocument()
    })
})
