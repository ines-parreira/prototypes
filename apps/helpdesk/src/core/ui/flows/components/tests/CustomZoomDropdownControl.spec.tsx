import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider, useReactFlow, useViewport } from '@xyflow/react'

import { CustomZoomDropdownControl } from '../CustomZoomDropdownControl'

jest.mock('@xyflow/react', () => ({
    ...jest.requireActual('@xyflow/react'),
    useReactFlow: jest.fn(),
    useViewport: jest.fn(),
}))

const mockUseReactFlow = useReactFlow as jest.MockedFunction<
    typeof useReactFlow
>
const mockUseViewport = useViewport as jest.MockedFunction<typeof useViewport>

const mockZoomTo = jest.fn()

const renderComponent = () => {
    return render(
        <ReactFlowProvider>
            <CustomZoomDropdownControl />
        </ReactFlowProvider>,
    )
}

describe('CustomZoomDropdownControl', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseReactFlow.mockReturnValue({
            zoomTo: mockZoomTo,
        } as any)
        mockUseViewport.mockReturnValue({
            zoom: 0.5,
            x: 0,
            y: 0,
        })
    })

    it('should display current zoom level', () => {
        renderComponent()

        expect(screen.getByText('50%')).toBeInTheDocument()
        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
    })

    it('should round zoom percentage correctly', () => {
        mockUseViewport.mockReturnValue({
            zoom: 0.754,
            x: 0,
            y: 0,
        })

        renderComponent()

        expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should show zoom options when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()
        const zoomDropdown = screen.getByText('50%').closest('button')

        await act(async () => {
            await user.click(zoomDropdown!)
        })

        await waitFor(() => {
            expect(screen.getByText('100%')).toBeInTheDocument()
            expect(screen.getByText('75%')).toBeInTheDocument()
            expect(screen.getByText('25%')).toBeInTheDocument()
            expect(screen.getByText('10%')).toBeInTheDocument()
        })
    })

    it('should call zoomTo when option is selected', async () => {
        const user = userEvent.setup()
        renderComponent()
        const zoomDropdown = screen.getByText('50%').closest('button')

        await act(async () => {
            await user.click(zoomDropdown!)
        })

        await waitFor(() => {
            expect(screen.getByText('75%')).toBeInTheDocument()
        })

        const option75 = screen.getByText('75%')

        await act(async () => {
            await user.click(option75)
        })

        await waitFor(() => expect(mockZoomTo).toHaveBeenCalledWith(0.75))
    })
})
