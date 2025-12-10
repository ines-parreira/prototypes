import { act, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
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

        expect(screen.getByDisplayValue('Select option')).toBeInTheDocument()
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

    it('should filter options when searching', async () => {
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => userEvent.click(trigger))

        const searchInput = screen.getByRole('searchbox')
        await act(() => userEvent.type(searchInput, 'open'))

        await waitFor(() => {
            const options = screen.getAllByRole('option')
            expect(options).toHaveLength(1)
            expect(options[0]).toHaveTextContent('Open')
        })
    })

    it('should show results with captions when searching', async () => {
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => userEvent.click(trigger))

        const searchInput = screen.getByRole('searchbox')
        await act(() => userEvent.type(searchInput, 'high'))

        await waitFor(() => {
            const listbox = screen.getByRole('listbox')
            expect(listbox).toHaveTextContent('High')
            expect(listbox).toHaveTextContent('Priority')
        })
    })

    it('should call onSelect when selecting a leaf option', async () => {
        const onSelect = vi.fn()
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={onSelect}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => userEvent.click(trigger))

        const listbox = await screen.findByRole('listbox')
        await act(() => userEvent.click(within(listbox).getByText('Status')))

        const openOptions = await screen.findAllByText('Open')
        await act(() => userEvent.click(openOptions[1]))

        expect(onSelect).toHaveBeenCalledWith('Status::Open')
    })

    it('should navigate up a level when clicking the back button', async () => {
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => userEvent.click(trigger))

        const listbox = await screen.findByRole('listbox')
        await act(() => userEvent.click(within(listbox).getByText('Status')))

        await screen.findAllByText('Open')

        const backButton = screen
            .getAllByRole('option')
            .find((el) => el.querySelector('[aria-label="arrow-chevron-left"]'))
        expect(backButton).toBeInTheDocument()

        await act(() => userEvent.click(backButton!))

        await screen.findAllByText('Priority')
    })

    it('should call onSelect with undefined when clicking clear button', async () => {
        const onSelect = vi.fn()
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={onSelect}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => userEvent.click(trigger))

        const clearButtons = await screen.findAllByText('Clear selection')
        const clearButton = clearButtons.find((el) =>
            el.closest('[role="listbox"]'),
        )
        await act(() => userEvent.click(clearButton!))

        expect(onSelect).toHaveBeenCalledWith(undefined)
    })

    it('should clear search when closing dropdown', async () => {
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => userEvent.click(trigger))

        const searchInput = screen.getByRole('searchbox')
        await act(() => userEvent.type(searchInput, 'open'))

        await waitFor(() => {
            const options = screen.getAllByRole('option')
            expect(options).toHaveLength(1)
        })

        await act(() => userEvent.click(document.body))
        await act(() => userEvent.click(trigger))

        const newSearchInput = await screen.findByRole('searchbox')
        expect(newSearchInput).toHaveValue('')
    })

    it('should reset to selected value path when opening dropdown', async () => {
        render(
            <MultiLevelSelect
                choices={choices}
                placeholder="Select option"
                selectedValue="Status::Open"
                ariaLabel="Select field"
                onSelect={vi.fn()}
            />,
        )

        const trigger = screen.getByLabelText('Select field')
        await act(() => userEvent.click(trigger))

        await screen.findAllByText('Open')
        await screen.findAllByText('Closed')

        const backButton = screen
            .getAllByRole('option')
            .find((el) => el.querySelector('[aria-label="arrow-chevron-left"]'))
        await act(() => userEvent.click(backButton!))

        await screen.findAllByText('Priority')

        await act(() => userEvent.click(document.body))

        await act(() => userEvent.click(trigger))

        await screen.findAllByText('Open')
        await screen.findAllByText('Closed')
    })
})
