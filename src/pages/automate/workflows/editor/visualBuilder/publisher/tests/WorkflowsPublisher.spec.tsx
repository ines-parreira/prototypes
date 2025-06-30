import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import useSelfServiceStandaloneContactFormChannels from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import { useWorkflowEditorContext } from 'pages/automate/workflows/hooks/useWorkflowEditor'

import WorkflowsPublisher from '../WorkflowsPublisher'

// Mock the hooks
jest.mock('pages/automate/workflows/hooks/useWorkflowEditor')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock('pages/automate/common/hooks/useSelfServiceHelpCenterChannels')
jest.mock(
    'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels',
)
jest.mock('react-router-dom', () => ({
    useParams: () => ({ shopType: 'shopify', shopName: 'test-shop' }),
}))

// Mock child components to simplify testing
jest.mock('../../EditorDrawerHeader', () => () => <div>EditorDrawerHeader</div>)
jest.mock('../channels/ChatChannels', () => () => <div>ChatChannels</div>)
jest.mock('../channels/ContactFormChannels', () => () => (
    <div>ContactFormChannels</div>
))
jest.mock('../channels/HelpCenterChannels', () => () => (
    <div>HelpCenterChannels</div>
))
jest.mock('../helper/NoChannelAlert', () => () => <div>NoChannelsAlert</div>)
jest.mock('../helper/ChannelLink', () => () => <div>ChannelsLink</div>)

const mockSetFlowPublishingInChannels = jest.fn()

const mockWorkflowEditorContext = {
    setFlowPublishingInChannels: mockSetFlowPublishingInChannels,
    isFlowPublishingInChannels: true,
    configuration: {
        id: 'test-workflow',
        name: 'Test Workflow',
    },
}

describe('WorkflowsPublisher', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useWorkflowEditorContext as jest.Mock).mockReturnValue(
            mockWorkflowEditorContext,
        )
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue([])
        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue([])
        ;(
            useSelfServiceStandaloneContactFormChannels as jest.Mock
        ).mockReturnValue([])
    })

    describe('backdrop click', () => {
        it('should call setFlowPublishingInChannels(false) when backdrop is clicked', async () => {
            const user = userEvent.setup()

            render(<WorkflowsPublisher />)

            // Find the backdrop element (Drawer creates a backdrop with role="presentation")
            const backdrop = screen.getByRole('presentation')

            // Click the backdrop
            await user.click(backdrop)

            // Assert that setFlowPublishingInChannels was called with false
            expect(mockSetFlowPublishingInChannels).toHaveBeenCalledWith(false)
            expect(mockSetFlowPublishingInChannels).toHaveBeenCalledTimes(1)
        })
    })
})
