import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider, useReactFlow, useViewport } from '@xyflow/react'

import { CustomZoomInControl } from '../CustomZoomInControl'

jest.mock('@xyflow/react', () => ({
    ...jest.requireActual('@xyflow/react'),
    useReactFlow: jest.fn(),
    useViewport: jest.fn(),
}))

const mockUseReactFlow = useReactFlow as jest.MockedFunction<
    typeof useReactFlow
>
const mockUseViewport = useViewport as jest.MockedFunction<typeof useViewport>

const mockZoomIn = jest.fn()

const renderComponent = () => {
    return render(
        <ReactFlowProvider>
            <CustomZoomInControl />
        </ReactFlowProvider>,
    )
}

describe('CustomZoomInControl', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseReactFlow.mockReturnValue({
            zoomIn: mockZoomIn,
        } as any)
        mockUseViewport.mockReturnValue({
            zoom: 0.5,
            x: 0,
            y: 0,
        })
    })

    it('should render zoom in button', () => {
        renderComponent()
        expect(screen.getByText('zoom_in')).toBeInTheDocument()
    })

    it('should call zoomIn when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()
        const zoomInIcon = screen.getByText('zoom_in')
        const zoomInButton = zoomInIcon.closest('button')!

        await act(async () => {
            await user.click(zoomInButton)
        })

        waitFor(() => {
            expect(mockZoomIn).toHaveBeenCalled()
        })
    })

    it('should be disabled when zoom is at maximum', () => {
        mockUseViewport.mockReturnValue({
            zoom: 1,
            x: 0,
            y: 0,
        })

        renderComponent()
        const zoomInIcon = screen.getByText('zoom_in')
        const zoomInButton = zoomInIcon.closest('button')!

        expect(zoomInButton).toHaveAttribute('aria-disabled', 'true')
    })
})
