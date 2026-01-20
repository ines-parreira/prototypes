import { act, screen } from '@testing-library/react'
import defaultUserEvent from '@testing-library/user-event'

import { renderWithStoreAndQueryClientProvider as render } from 'tests/renderWithStoreAndQueryClientProvider'

import { SortingButton } from '../components/SortingButton'
import type { SortOption } from '../hooks/useTimelineData'

describe('SortingButton', () => {
    const mockOnSortChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('handleSortClick', () => {
        it('should toggle sort direction when clicking the same field (desc to asc)', async () => {
            render(
                <SortingButton
                    sortOption={'updated-desc' as SortOption}
                    onSortChange={mockOnSortChange}
                />,
            )

            // Click the sorting button to open menu
            const sortButton = screen.getByRole('button')
            await act(() => defaultUserEvent.click(sortButton))

            // Click "Last updated" to toggle direction (desc -> asc)
            // Use getAllByText because MultiSelect renders both a hidden option and visible item
            const lastUpdatedOptions =
                await screen.findAllByText('Last updated')
            // Click the visible one (usually the last one in the array)
            await act(() =>
                defaultUserEvent.click(
                    lastUpdatedOptions[lastUpdatedOptions.length - 1],
                ),
            )

            // Should call onSortChange with asc direction
            expect(mockOnSortChange).toHaveBeenCalledWith('updated-asc')
        })

        it('should toggle sort direction back when clicking the same field again (asc to desc)', async () => {
            render(
                <SortingButton
                    sortOption={'updated-asc' as SortOption}
                    onSortChange={mockOnSortChange}
                />,
            )

            // Click the sorting button
            const sortButton = screen.getByRole('button')
            await act(() => defaultUserEvent.click(sortButton))

            // Click "Last updated" to toggle direction (asc -> desc)
            const lastUpdatedOptions =
                await screen.findAllByText('Last updated')
            await act(() =>
                defaultUserEvent.click(
                    lastUpdatedOptions[lastUpdatedOptions.length - 1],
                ),
            )

            // Should call onSortChange with desc direction
            expect(mockOnSortChange).toHaveBeenCalledWith('updated-desc')
        })

        it('should switch to different field with default descending direction', async () => {
            render(
                <SortingButton
                    sortOption={'updated-desc' as SortOption}
                    onSortChange={mockOnSortChange}
                />,
            )

            // Click sorting button to open menu
            const sortButton = screen.getByRole('button')
            await act(() => defaultUserEvent.click(sortButton))

            // Click "Created" to switch field (should default to desc)
            const createdOptions = await screen.findAllByText('Created')
            await act(() =>
                defaultUserEvent.click(
                    createdOptions[createdOptions.length - 1],
                ),
            )

            // Should call onSortChange with created-desc
            expect(mockOnSortChange).toHaveBeenCalledWith('created-desc')
        })

        it('should switch back to original field with default descending direction', async () => {
            render(
                <SortingButton
                    sortOption={'created-asc' as SortOption}
                    onSortChange={mockOnSortChange}
                />,
            )

            const sortButton = screen.getByRole('button')

            // Click to open menu
            await act(() => defaultUserEvent.click(sortButton))

            // Switch to "Last updated" (should default to desc)
            const lastUpdatedOptions =
                await screen.findAllByText('Last updated')
            await act(() =>
                defaultUserEvent.click(
                    lastUpdatedOptions[lastUpdatedOptions.length - 1],
                ),
            )

            // Should call onSortChange with updated-desc
            expect(mockOnSortChange).toHaveBeenCalledWith('updated-desc')
        })

        it('should display correct sort direction indicator', async () => {
            const { rerender } = render(
                <SortingButton
                    sortOption={'updated-desc' as SortOption}
                    onSortChange={mockOnSortChange}
                />,
            )

            // Open sort menu
            const sortButton = screen.getByRole('button')
            await act(() => defaultUserEvent.click(sortButton))

            // Should show arrow-down icon for desc (default)
            expect(screen.getByLabelText('arrow-down')).toBeInTheDocument()

            // Close menu
            await act(() => defaultUserEvent.click(sortButton))

            // Rerender with asc direction
            rerender(
                <SortingButton
                    sortOption={'updated-asc' as SortOption}
                    onSortChange={mockOnSortChange}
                />,
            )

            // Open menu again
            await act(() => defaultUserEvent.click(sortButton))

            // Should now show arrow-up icon for asc
            expect(screen.getByLabelText('arrow-up')).toBeInTheDocument()
        })
    })
})
