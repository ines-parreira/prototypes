import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ColumnEditingFooter } from './ColumnEditingFooter'

const SAVED_COLUMNS = ['name', 'automationRate']
const VISIBLE_COLUMNS = ['name', 'automationRate', 'handovers']

function renderFooter(
    overrides: Partial<React.ComponentProps<typeof ColumnEditingFooter>> = {},
) {
    const props = {
        setIsOpen: vi.fn(),
        visibleColumns: VISIBLE_COLUMNS,
        setVisibleColumns: vi.fn(),
        savedColumns: SAVED_COLUMNS,
        setSavedColumns: vi.fn(),
        onSaveVisibleColumns: vi.fn(),
        ...overrides,
    }
    render(<ColumnEditingFooter {...props} />)
    return props
}

describe('ColumnEditingFooter', () => {
    it('renders Cancel and Save buttons', () => {
        renderFooter()

        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /save/i }),
        ).toBeInTheDocument()
    })

    describe('Cancel', () => {
        it('closes the panel and resets visible columns to saved columns', async () => {
            const user = userEvent.setup()
            const { setIsOpen, setVisibleColumns, savedColumns } =
                renderFooter()

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(setIsOpen).toHaveBeenCalledWith(false)
            expect(setVisibleColumns).toHaveBeenCalledWith(savedColumns)
        })

        it('does not save or call onSaveVisibleColumns', async () => {
            const user = userEvent.setup()
            const { setSavedColumns, onSaveVisibleColumns } = renderFooter()

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(setSavedColumns).not.toHaveBeenCalled()
            expect(onSaveVisibleColumns).not.toHaveBeenCalled()
        })
    })

    describe('Save', () => {
        it('closes the panel and persists the visible columns', async () => {
            const user = userEvent.setup()
            const { setIsOpen, setSavedColumns, visibleColumns } =
                renderFooter()

            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(setIsOpen).toHaveBeenCalledWith(false)
            expect(setSavedColumns).toHaveBeenCalledWith(visibleColumns)
        })

        it('calls onSaveVisibleColumns with the current visible columns', async () => {
            const user = userEvent.setup()
            const { onSaveVisibleColumns, visibleColumns } = renderFooter()

            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(onSaveVisibleColumns).toHaveBeenCalledWith(visibleColumns)
        })

        it('does not throw when onSaveVisibleColumns is not provided', async () => {
            const user = userEvent.setup()
            renderFooter({ onSaveVisibleColumns: undefined })

            await expect(
                user.click(screen.getByRole('button', { name: /save/i })),
            ).resolves.not.toThrow()
        })

        it('does not reset visible columns to saved columns', async () => {
            const user = userEvent.setup()
            const { setVisibleColumns } = renderFooter()

            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(setVisibleColumns).not.toHaveBeenCalled()
        })
    })
})
