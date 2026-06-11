import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import type { ChannelChange, ChannelWithMetadata } from '../../../../types'
import { ChannelsDrawer } from '../ChannelsDrawer'

const mockChannel: ChannelWithMetadata = {
    title: 'Test Channel',
    description: 'Test Description',
    count: 1,
    type: 'email',
    assignedChannels: [],
    unassignedChannels: [],
}
const defaultProps = {
    isLoading: false,
    activeChannel: mockChannel,
    changes: [] as ChannelChange[],
    onCloseDrawer: jest.fn(),
    onSaveDrawer: jest.fn(),
    setChanges: jest.fn(),
}
describe('ChannelsDrawer', () => {
    it('renders nothing when activeChannel is not provided', () => {
        const { container } = render(
            <ChannelsDrawer {...defaultProps} activeChannel={null as any} />,
            { storeState: {} },
        )
        expect(container.firstChild).toBeNull()
    })
    it('renders drawer with channel title', () => {
        render(<ChannelsDrawer {...defaultProps} />, { storeState: {} })
        expect(screen.getByText('Test Channel')).toBeInTheDocument()
    })
    it('calls onCloseDrawer when Cancel button is clicked', () => {
        render(<ChannelsDrawer {...defaultProps} />, { storeState: {} })
        fireEvent.click(screen.getByText('Cancel'))
        expect(defaultProps.onCloseDrawer).toHaveBeenCalled()
    })
    it('disables Save Changes button when no changes exist', () => {
        render(<ChannelsDrawer {...defaultProps} />, { storeState: {} })
        const saveButton = screen.getByRole('button', { name: 'Save Changes' })
        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
    })
    it('enables Save Changes button when changes exist', () => {
        render(
            <ChannelsDrawer
                {...defaultProps}
                changes={[{ channelId: 1, action: 'add' }]}
            />,
            { storeState: {} },
        )
        expect(screen.getByText('Save Changes')).toBeEnabled()
    })
})
