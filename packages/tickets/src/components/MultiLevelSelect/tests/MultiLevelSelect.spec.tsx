import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { render } from '../../../tests/render.utils'
import { MultiLevelSelect } from '../MultiLevelSelect'

describe('MultiLevelSelect', () => {
    const choices = [
        'Status::Open',
        'Status::Closed',
        'Priority::High',
        'Priority::Low',
    ]

    it('should render with placeholder', () => {
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        expect(screen.getByPlaceholderText('Select option')).toBeInTheDocument()
    })

    it('should render with selected value', () => {
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        expect(screen.getAllByText('Open')[0]).toBeInTheDocument()
    })

    it('should hide search input when isSearchable is false', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })

    it('should filter options when searching', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                isSearchable
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        const searchInput = screen.getByRole('searchbox')
        await act(() => user.type(searchInput, 'open'))

        await waitFor(() => {
            const options = screen.getAllByRole('option')
            expect(options).toHaveLength(1)
            expect(options[0]).toHaveTextContent('Open')
        })
    })

    it('should show results with captions when searching', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                isSearchable
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        const searchInput = screen.getByRole('searchbox')
        await act(() => user.type(searchInput, 'high'))

        await waitFor(() => {
            const listbox = screen.getByRole('listbox')
            expect(listbox).toHaveTextContent('High')
            expect(listbox).toHaveTextContent('Priority')
        })
    })

    it('should call onSelect when selecting a leaf option', async () => {
        const onSelect = vi.fn()
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={onSelect}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        const listbox = await screen.findByRole('listbox')
        await act(() => user.click(within(listbox).getByText('Status')))

        const openOptions = await screen.findAllByText('Open')
        await act(() => user.click(openOptions[1]))

        expect(onSelect).toHaveBeenCalledWith('Status::Open')
    })

    it('should navigate up a level when clicking the back button', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        const listbox = await screen.findByRole('listbox')
        await act(() => user.click(within(listbox).getByText('Status')))

        await screen.findAllByText('Open')

        const backButton = screen.getByRole('button', { name: /Status/i })
        expect(backButton).toBeInTheDocument()

        await act(() => user.click(backButton))

        await screen.findAllByText('Priority')
    })

    it('should show clear button when value is selected', async () => {
        const { user, rerender } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        expect(
            screen.queryByRole('button', { name: 'Clear selection' }),
        ).not.toBeInTheDocument()

        const listbox = await screen.findByRole('listbox')
        await act(() => user.click(within(listbox).getByText('Status')))

        const openOption = await screen.findAllByText('Open')
        await act(() => user.click(openOption[1]))

        rerender(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        await act(() => user.click(trigger))

        expect(
            await screen.findByRole('button', { name: 'Clear selection' }),
        ).toBeInTheDocument()
    })

    it('should call onSelect with undefined when clicking clear button', async () => {
        const onSelect = vi.fn()
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={onSelect}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        const clearButton = await screen.findByRole('button', {
            name: 'Clear selection',
        })
        await act(() => user.click(clearButton))

        expect(onSelect).toHaveBeenCalledWith(undefined)
    })

    it('should clear search when closing dropdown', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                isSearchable
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        const searchInput = screen.getByRole('searchbox')
        await act(() => user.type(searchInput, 'open'))

        await waitFor(() => {
            const options = screen.getAllByRole('option')
            expect(options).toHaveLength(1)
        })

        await act(() => user.click(document.body))
        await act(() => user.click(trigger))

        const newSearchInput = await screen.findByRole('searchbox')
        expect(newSearchInput).toHaveValue('')
    })

    it('should reset to selected value path when opening dropdown', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        await screen.findAllByText('Open')
        await screen.findAllByText('Closed')

        const backButton = screen.getByRole('button', { name: /Status/i })
        await act(() => user.click(backButton))

        await screen.findAllByText('Priority')

        await act(() => user.click(document.body))

        await act(() => user.click(trigger))

        await screen.findAllByText('Open')
        await screen.findAllByText('Closed')
    })

    it('should not show tooltip when showTooltip is false', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={vi.fn()}
                showTooltip={false}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await user.hover(trigger)

        expect(screen.queryByText('Status > Open')).not.toBeInTheDocument()
    })

    it('should show tooltip with full hierarchical value when showTooltip is true', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={vi.fn()}
                showTooltip
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await user.hover(trigger)

        await waitFor(() => {
            expect(screen.getByText('Status > Open')).toBeInTheDocument()
        })
    })

    it('should allow navigating into the same section after closing and reopening', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => user.click(trigger))

        const listbox = await screen.findByRole('listbox')
        await act(() => user.click(within(listbox).getByText('Status')))

        await screen.findAllByText('Open')

        await act(() => user.click(document.body))

        await act(() => user.click(trigger))

        const reopenedListbox = await screen.findByRole('listbox')
        await act(() => user.click(within(reopenedListbox).getByText('Status')))

        await waitFor(() => {
            expect(screen.getAllByText('Open').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Closed').length).toBeGreaterThan(0)
        })
    })

    it('should not show tooltip when there is no selected value', async () => {
        const { user } = render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
                showTooltip
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await user.hover(trigger)

        const tooltipTexts = screen.queryAllByText(/.*>.*/)
        expect(tooltipTexts).toHaveLength(0)
    })
})
