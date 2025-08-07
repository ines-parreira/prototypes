import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider, useReactFlow, useViewport } from 'reactflow'

import { CustomZoomOutControl } from '../CustomZoomOutControl'

jest.mock('reactflow', () => ({
    ...jest.requireActual('reactflow'),
    useReactFlow: jest.fn(),
    useViewport: jest.fn(),
}))

const mockUseReactFlow = useReactFlow as jest.MockedFunction<
    typeof useReactFlow
>
const mockUseViewport = useViewport as jest.MockedFunction<typeof useViewport>

const mockZoomOut = jest.fn()

const renderComponent = () => {
    return render(
        <ReactFlowProvider>
            <CustomZoomOutControl />
        </ReactFlowProvider>,
    )
}

describe('CustomZoomOutControl', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseReactFlow.mockReturnValue({
            zoomOut: mockZoomOut,
        } as any)
        mockUseViewport.mockReturnValue({
            zoom: 0.5,
            x: 0,
            y: 0,
        })
    })

    it('should render zoom out button', () => {
        renderComponent()
        expect(screen.getByText('zoom_out')).toBeInTheDocument()
    })

    it('should call zoomOut when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()
        const zoomOutIcon = screen.getByText('zoom_out')
        const zoomOutButton = zoomOutIcon.closest('button')!

        await act(async () => {
            await user.click(zoomOutButton)
        })

        await waitFor(() => {
            expect(mockZoomOut).toHaveBeenCalled()
        })
    })

    it('should be disabled when zoom is at minimum', () => {
        mockUseViewport.mockReturnValue({
            zoom: 0.1,
            x: 0,
            y: 0,
        })

        renderComponent()
        const zoomOutIcon = screen.getByText('zoom_out')
        const zoomOutButton = zoomOutIcon.closest('button')!

        expect(zoomOutButton).toHaveAttribute('aria-disabled', 'true')
    })
})
