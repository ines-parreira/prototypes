import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider, useReactFlow, useViewport } from '@xyflow/react'

import { CustomControls } from '../CustomControls'

jest.mock('@xyflow/react', () => ({
    ...jest.requireActual('@xyflow/react'),
    useReactFlow: jest.fn(),
    useViewport: jest.fn(),
    Panel: ({ children, position }: any) => (
        <div className={`react-flow__panel ${position}`}>{children}</div>
    ),
}))

const mockUseReactFlow = useReactFlow as jest.MockedFunction<
    typeof useReactFlow
>
const mockUseViewport = useViewport as jest.MockedFunction<typeof useViewport>

const mockZoomIn = jest.fn()
const mockZoomOut = jest.fn()
const mockFitView = jest.fn()
const mockZoomTo = jest.fn()

const renderComponent = () => {
    return render(
        <ReactFlowProvider>
            <CustomControls />
        </ReactFlowProvider>,
    )
}

describe('CustomControls', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseReactFlow.mockReturnValue({
            zoomIn: mockZoomIn,
            zoomOut: mockZoomOut,
            fitView: mockFitView,
            zoomTo: mockZoomTo,
        } as any)
        mockUseViewport.mockReturnValue({
            zoom: 0.5,
            x: 0,
            y: 0,
        })
    })

    it('should render all control buttons', () => {
        renderComponent()

        expect(screen.getByText('zoom_in')).toBeInTheDocument()
        expect(screen.getByText('zoom_out')).toBeInTheDocument()
        expect(screen.getByText('filter_center_focus')).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should render within a Panel component', () => {
        const { container } = renderComponent()
        const panel = container.querySelector('.react-flow__panel')

        expect(panel).toBeInTheDocument()
        expect(panel).toHaveClass('top-left')
    })

    it('should integrate all controls correctly', async () => {
        const user = userEvent.setup()
        renderComponent()

        const zoomInIcon = screen.getByText('zoom_in')
        const zoomInButton = zoomInIcon.closest('button')!
        await act(async () => {
            await user.click(zoomInButton)
        })
        await waitFor(() => expect(mockZoomIn).toHaveBeenCalled())

        const zoomOutIcon = screen.getByText('zoom_out')
        const zoomOutButton = zoomOutIcon.closest('button')!
        await act(async () => {
            await user.click(zoomOutButton)
        })
        await waitFor(() => expect(mockZoomOut).toHaveBeenCalled())

        const fitViewIcon = screen.getByText('filter_center_focus')
        const fitViewButton = fitViewIcon.closest('button')!
        await act(async () => {
            await user.click(fitViewButton)
        })
        await waitFor(() => expect(mockFitView).toHaveBeenCalled())
    })
})
