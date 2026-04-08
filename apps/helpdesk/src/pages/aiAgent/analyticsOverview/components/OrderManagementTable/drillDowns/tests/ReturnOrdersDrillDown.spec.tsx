import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { ReturnOrdersDrillDown } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/drillDowns/ReturnOrdersDrillDown'
import { useReturnOrdersDrillDownData } from 'pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData'

jest.mock('pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData')

const mockUseReturnOrdersDrillDownData = assumeMock(
    useReturnOrdersDrillDownData,
)

describe('ReturnOrdersDrillDown', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = ({
        count = 5,
        isLoading = false,
    }: { count?: number; isLoading?: boolean } = {}) => {
        mockUseReturnOrdersDrillDownData.mockReturnValue({
            count,
            isLoading,
            rows: [],
        })
        return render(<ReturnOrdersDrillDown />)
    }

    it('renders the trigger with the item count', () => {
        renderComponent({ count: 7 })

        expect(
            screen.getByRole('button', { name: /7 items/i }),
        ).toBeInTheDocument()
    })

    it('does not render the trigger when isLoading is true', () => {
        renderComponent({ isLoading: true, count: 5 })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not render the trigger when count is 0', () => {
        renderComponent({ count: 0 })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not render the side panel initially', () => {
        renderComponent()

        expect(screen.queryByText('Return orders')).not.toBeInTheDocument()
    })
})
