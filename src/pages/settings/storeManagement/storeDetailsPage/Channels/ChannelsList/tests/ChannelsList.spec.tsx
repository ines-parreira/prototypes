import { fireEvent, render, screen } from '@testing-library/react'

import ChannelsList from '../ChannelsList'

const mockChannels = [
    {
        id: 1,
        name: 'First Email',
        type: 'email',
        meta: {
            address: 'test@example.com',
        },
    },
    {
        id: 2,
        name: 'Second Email',
        type: 'email',
        meta: {
            address: 'another@example.com',
        },
    },
]

describe('AssignedChannelsList', () => {
    it('renders channels list correctly', () => {
        const onDelete = jest.fn()
        render(
            <ChannelsList
                channelType="email"
                channels={mockChannels}
                onDelete={onDelete}
            />,
        )

        expect(screen.getByText(/Assigned email/i)).toBeInTheDocument()
        expect(screen.getByText('First Email')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('Second Email')).toBeInTheDocument()
        expect(screen.getByText('another@example.com')).toBeInTheDocument()
    })

    it('returns null when no channels are provided', () => {
        const onDelete = jest.fn()
        const { container } = render(
            <ChannelsList
                channelType="email"
                channels={[]}
                onDelete={onDelete}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('calls onDelete when delete button is clicked', () => {
        const onDelete = jest.fn()
        render(
            <ChannelsList
                channelType="email"
                channels={mockChannels}
                onDelete={onDelete}
            />,
        )

        const deleteButtons = screen.getAllByText('close')

        fireEvent.click(deleteButtons[0])

        expect(onDelete).toHaveBeenCalledWith(1)
    })
})
