import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { FilteringButton } from '../FilteringButton'

const mockOnFilterSelect = jest.fn()
const mockOnOpenChange = jest.fn()

const defaultProps = {
    onFilterSelect: mockOnFilterSelect,
    activeFilters: new Set<'dateRange' | 'interactionType' | 'ticketStatus'>(),
}

const renderComponent = (props = {}) => {
    return renderWithStoreAndQueryClientProvider(
        <FilteringButton {...defaultProps} {...props} />,
    )
}

describe('FilteringButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the filter button', () => {
        renderComponent()

        const button = screen.getByRole('button', { name: /slider-filter/i })
        expect(button).toBeInTheDocument()
    })

    it('should call onOpenChange when dropdown is opened', async () => {
        const user = userEvent.setup()
        renderComponent({
            isOpen: false,
            onOpenChange: mockOnOpenChange,
        })

        const button = screen.getByRole('button', { name: /slider-filter/i })
        await user.click(button)

        expect(mockOnOpenChange).toHaveBeenCalledWith(true)
    })

    it('should work with active filters', () => {
        const activeFilters = new Set(['dateRange', 'interactionType']) as Set<
            'dateRange' | 'interactionType' | 'ticketStatus'
        >

        renderComponent({ activeFilters })

        expect(
            screen.getByRole('button', { name: /slider-filter/i }),
        ).toBeInTheDocument()
    })
})
