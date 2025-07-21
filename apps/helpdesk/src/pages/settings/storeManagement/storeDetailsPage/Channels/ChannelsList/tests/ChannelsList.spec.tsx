import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { Integration, IntegrationType } from 'models/integration/types'

import { ChannelWithMetadata } from '../../../../types'
import ChannelsList from '../ChannelsList'

const mockChannels = [
    {
        id: 1,
        name: 'First Email',
        type: IntegrationType.Email,
        meta: {
            address: 'test@example.com',
        },
    },
    {
        id: 2,
        name: 'Second Email',
        type: IntegrationType.Email,
        meta: {
            address: 'another@example.com',
        },
    },
] as Integration[]

const mockChannelsWithoutAddress = [
    {
        id: 3,
        name: 'Facebook',
        type: IntegrationType.Facebook,
        meta: {},
    },
] as Integration[]

const mockHelpCenterChannel = [
    {
        id: 4,
        name: 'Help Center 1',
        type: IntegrationType.App,
        meta: {
            address: 'help-center-something',
        },
    },
] as Integration[]

const mockContactFormChannel = [
    {
        id: 5,
        name: 'Contact Form 1',
        type: IntegrationType.App,
        meta: {
            address: 'contact-form-something',
        },
    },
] as Integration[]

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ChannelsList', () => {
    const defaultProps = {
        activeChannel: {} as ChannelWithMetadata,
    }

    it('renders channels list correctly', () => {
        const onDelete = jest.fn()
        renderWithRouter(
            <ChannelsList
                {...defaultProps}
                listLabel="Assigned Email"
                channels={mockChannels}
                onDelete={onDelete}
            />,
        )

        expect(screen.getByText(/Assigned email/i)).toBeInTheDocument()
        expect(screen.getByText('First Email')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('Second Email')).toBeInTheDocument()
        expect(screen.getByText('another@example.com')).toBeInTheDocument()
        expect(screen.getAllByText('open_in_new')).toHaveLength(2)
    })

    it('returns null when no channels are provided', () => {
        const onDelete = jest.fn()
        const { container } = renderWithRouter(
            <ChannelsList
                {...defaultProps}
                listLabel="Assigned Email"
                channels={[]}
                onDelete={onDelete}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('calls onDelete when delete button is clicked', () => {
        const onDelete = jest.fn()
        renderWithRouter(
            <ChannelsList
                {...defaultProps}
                listLabel="Assigned Email"
                channels={mockChannels}
                onDelete={onDelete}
            />,
        )

        const deleteButtons = screen.getAllByText('delete')
        fireEvent.click(deleteButtons[0])

        expect(onDelete).toHaveBeenCalledWith(1)
    })

    it('renders empty when channel meta does not have address', () => {
        const onDelete = jest.fn()
        renderWithRouter(
            <ChannelsList
                {...defaultProps}
                listLabel="Assigned Facebook"
                channels={mockChannelsWithoutAddress}
                onDelete={onDelete}
            />,
        )

        expect(screen.getByText('Facebook')).toBeInTheDocument()
    })

    it('does not render open in new icon for help center channel', () => {
        const onDelete = jest.fn()
        renderWithRouter(
            <ChannelsList
                {...defaultProps}
                listLabel="Help Center"
                channels={mockHelpCenterChannel}
                onDelete={onDelete}
            />,
        )

        expect(screen.queryByText('open_in_new')).not.toBeInTheDocument()
        expect(screen.getByText('delete')).toBeInTheDocument()
        expect(screen.getByText('Help Center 1')).toBeInTheDocument()
    })

    it('does not render open in new icon for contact form channel', () => {
        const onDelete = jest.fn()
        renderWithRouter(
            <ChannelsList
                {...defaultProps}
                listLabel="Contact Form"
                channels={mockContactFormChannel}
                onDelete={onDelete}
            />,
        )

        expect(screen.queryByText('open_in_new')).not.toBeInTheDocument()
        expect(screen.getByText('delete')).toBeInTheDocument()
        expect(screen.getByText('Contact Form 1')).toBeInTheDocument()
    })

    it('shows tooltip and doesnt show delete button for contact form channels', () => {
        const onDelete = jest.fn()
        renderWithRouter(
            <ChannelsList
                activeChannel={
                    {
                        type: 'contactForm',
                        assignedChannels: [
                            {
                                id: 1,
                            },
                        ],
                    } as ChannelWithMetadata
                }
                listLabel="Assigned Email"
                channels={
                    [
                        {
                            id: 1,
                            name: 'Contact Form',
                            type: IntegrationType.App,
                            meta: {
                                address: 'contact-form|',
                            },
                        },
                    ] as Integration[]
                }
                onDelete={onDelete}
            />,
        )

        expect(screen.queryByText('delete')).not.toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
    })
})
