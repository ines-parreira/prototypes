import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FlowProvider } from 'core/ui/flows'

import { VoiceStepNode } from '../VoiceStepNode'

const mockUseDeleteNode = jest.fn()
jest.mock(
    'pages/integrations/integration/components/voice/flows/utils/useDeleteNode',
    () => ({
        useDeleteNode: () => ({ deleteNode: mockUseDeleteNode }),
    }),
)

const mockIcon = <span>Test Icon</span>
const mockChildren = <div>Test Content</div>

const renderComponent = (props: any) => {
    return render(
        <FlowProvider>
            <VoiceStepNode {...props} />
        </FlowProvider>,
    )
}

describe('VoiceStepNode', () => {
    const defaultProps = {
        title: 'Test Title',
        description: 'Test Description',
        icon: mockIcon,
        errors: [],
        children: mockChildren,
        id: 'test-id',
    }

    it('renders with basic props', () => {
        renderComponent(defaultProps)

        expect(screen.getAllByText('Test Title')).toHaveLength(2) // drawer and card
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Test Icon')).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
        expect(
            screen.getByText('Learn more about Call Flows'),
        ).toBeInTheDocument()

        expect(screen.queryByText('warning_amber')).toBeNull()
    })

    it('renders with errors', () => {
        const errors = ['Error 1', 'Error 2']
        renderComponent({ ...defaultProps, errors })

        expect(screen.getByText('warning_amber')).toBeInTheDocument()
    })

    it('selects card when clicked', async () => {
        const user = userEvent.setup()
        renderComponent(defaultProps)

        const stepCardWrapper = screen.getByLabelText('Step node')
        expect(stepCardWrapper).toBeInTheDocument()

        // Click on the card wrapper
        await act(async () => {
            await user.click(stepCardWrapper!)
        })

        await waitFor(() => {
            expect(stepCardWrapper?.firstElementChild).toHaveClass('selected')
        })
    })

    it('renders delete action menu item', async () => {
        const user = userEvent.setup()
        renderComponent(defaultProps)

        const menuButton = screen.getByTitle('Action menu')

        await act(async () => {
            await user.click(menuButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Delete')).toBeInTheDocument()
        })

        await act(async () => {
            await user.click(screen.getByText('Delete'))
        })

        await waitFor(() => {
            expect(mockUseDeleteNode).toHaveBeenCalledWith(defaultProps.id)
        })
    })
})
