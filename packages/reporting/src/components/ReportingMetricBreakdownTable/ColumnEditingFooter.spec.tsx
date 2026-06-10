import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ColumnEditingFooter } from './ColumnEditingFooter'

const SAVED_COLUMNS = [
    { column_id: 'name', visible: true },
    { column_id: 'automationRate', visible: true },
]
const COLUMNS = [
    { column_id: 'name', visible: true },
    { column_id: 'automationRate', visible: true },
    { column_id: 'handovers', visible: true },
]

function renderFooter(
    overrides: Partial<React.ComponentProps<typeof ColumnEditingFooter>> = {},
) {
    const props = {
        setIsOpen: vi.fn(),
        columns: COLUMNS,
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
            const { setIsOpen, setVisibleColumns } = renderFooter()

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(setIsOpen).toHaveBeenCalledWith(false)
            expect(setVisibleColumns).toHaveBeenCalledWith([
                'name',
                'automationRate',
            ])
        })

        it('does not save or call onSaveVisibleColumns', async () => {
            const user = userEvent.setup()
            const { setSavedColumns, onSaveVisibleColumns } = renderFooter()

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(setSavedColumns).not.toHaveBeenCalled()
            expect(onSaveVisibleColumns).not.toHaveBeenCalled()
        })

        it('resets only visible columns when saved state has hidden columns', async () => {
            const user = userEvent.setup()
            const savedWithHidden = [
                { column_id: 'name', visible: true },
                { column_id: 'automationRate', visible: false },
            ]
            const { setVisibleColumns } = renderFooter({
                savedColumns: savedWithHidden,
            })

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(setVisibleColumns).toHaveBeenCalledWith(['name'])
        })
    })

    describe('Save', () => {
        it('closes the panel and persists all columns including hidden ones', async () => {
            const user = userEvent.setup()
            const columnsWithHidden = [
                { column_id: 'name', visible: true },
                { column_id: 'automationRate', visible: false },
                { column_id: 'handovers', visible: true },
            ]
            const { setIsOpen, setSavedColumns } = renderFooter({
                columns: columnsWithHidden,
            })

            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(setIsOpen).toHaveBeenCalledWith(false)
            expect(setSavedColumns).toHaveBeenCalledWith(columnsWithHidden)
        })

        it('calls onSaveVisibleColumns with all columns in order', async () => {
            const user = userEvent.setup()
            const { onSaveVisibleColumns } = renderFooter()

            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(onSaveVisibleColumns).toHaveBeenCalledWith(COLUMNS)
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
