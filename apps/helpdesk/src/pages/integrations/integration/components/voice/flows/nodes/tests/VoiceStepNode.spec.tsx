import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { ReactFlowProvider } from 'core/ui/flows'

import { VoiceStepNode } from '../VoiceStepNode'

const mockIcon = <span>Test Icon</span>
const mockChildren = <div>Test Content</div>

const renderComponent = (props: any) => {
    return render(
        <ReactFlowProvider>
            <VoiceStepNode {...props} />
        </ReactFlowProvider>,
    )
}

describe('VoiceStepNode', () => {
    const defaultProps = {
        title: 'Test Title',
        description: 'Test Description',
        icon: mockIcon,
        errors: [],
        children: mockChildren,
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
        act(() => {
            user.click(stepCardWrapper!)
        })

        await waitFor(() => {
            expect(stepCardWrapper?.firstElementChild).toHaveClass('selected')
        })
    })

    it('renders delete action menu item', async () => {
        renderComponent(defaultProps)

        const menuButton = screen.getByTitle('Action menu')

        act(() => {
            userEvent.click(menuButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Delete')).toBeInTheDocument()
        })
    })
})
