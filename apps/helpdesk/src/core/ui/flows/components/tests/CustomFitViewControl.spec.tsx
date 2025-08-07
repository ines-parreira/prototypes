import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider, useReactFlow } from 'reactflow'

import { CustomFitViewControl } from '../CustomFitViewControl'

jest.mock('reactflow', () => ({
    ...jest.requireActual('reactflow'),
    useReactFlow: jest.fn(),
}))

const mockUseReactFlow = useReactFlow as jest.MockedFunction<
    typeof useReactFlow
>

const mockFitView = jest.fn()

const renderComponent = () => {
    return render(
        <ReactFlowProvider>
            <CustomFitViewControl />
        </ReactFlowProvider>,
    )
}

describe('CustomFitViewControl', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseReactFlow.mockReturnValue({
            fitView: mockFitView,
        } as any)
    })

    it('should render fit view button', () => {
        renderComponent()

        expect(screen.getByText('filter_center_focus')).toBeInTheDocument()
    })

    it('should call fitView when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()
        const fitViewIcon = screen.getByText('filter_center_focus')
        const fitViewButton = fitViewIcon.closest('button')!

        await act(async () => {
            await user.click(fitViewButton)
        })

        await waitFor(() => {
            expect(mockFitView).toHaveBeenCalled()
        })
    })
})
