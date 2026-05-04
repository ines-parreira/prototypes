import { useState } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { act, fireEvent } from '@testing-library/react'

import type { SearchRow } from '../../types'
import { useSearchSpotlightKeyboard } from '../useSearchSpotlightKeyboard'

const rows: Array<{ globalIndex: number; row: SearchRow }> = [
    {
        globalIndex: 0,
        row: {
            kind: 'ticket',
            id: 1,
            raw: { id: 1 },
            url: '/app/ticket/1',
            subject: { text: 'First' },
            customerName: { text: 'Ada' },
            statusLabel: 'Open',
            statusColor: 'purple',
            isUnread: true,
            activityLabel: '',
            agentName: '',
        },
    },
    {
        globalIndex: 1,
        row: {
            kind: 'ticket',
            id: 2,
            raw: { id: 2 },
            url: '/app/ticket/2',
            subject: { text: 'Second' },
            customerName: { text: 'Grace' },
            statusLabel: 'Open',
            statusColor: 'purple',
            isUnread: false,
            activityLabel: '',
            agentName: '',
        },
    },
]

function renderKeyboardHook({ isOpen = true, rows: hookRows = rows } = {}) {
    const goToAdvancedSearch = vi.fn()
    const onKeyboardSelectionChange = vi.fn()
    const openRow = vi.fn().mockResolvedValue(undefined)

    const hook = renderHook(() => {
        const [currentSelectedIndex, setSelectedIndex] = useState(0)

        useSearchSpotlightKeyboard({
            flatRows: hookRows,
            goToAdvancedSearch,
            isOpen,
            openRow,
            onKeyboardSelectionChange,
            selectedIndex: currentSelectedIndex,
            setSelectedIndex,
        })

        return {
            selectedIndex: currentSelectedIndex,
        }
    })

    return {
        ...hook,
        goToAdvancedSearch,
        onKeyboardSelectionChange,
        openRow,
    }
}

describe('useSearchSpotlightKeyboard', () => {
    it('moves the selected row with ArrowDown and ArrowUp', () => {
        const { result } = renderKeyboardHook()

        act(() => {
            fireEvent.keyDown(document, { key: 'ArrowDown' })
        })

        expect(result.current.selectedIndex).toBe(1)

        act(() => {
            fireEvent.keyDown(document, { key: 'ArrowUp' })
        })

        expect(result.current.selectedIndex).toBe(0)
    })

    it('opens the selected row on Enter and advanced search on Shift+Enter', async () => {
        const { goToAdvancedSearch, openRow } = renderKeyboardHook()

        await act(async () => {
            fireEvent.keyDown(document, { key: 'Enter' })
        })

        expect(openRow).toHaveBeenCalledWith(rows[0].row, false)

        act(() => {
            fireEvent.keyDown(document, { key: 'Enter', shiftKey: true })
        })

        expect(goToAdvancedSearch).toHaveBeenCalledTimes(1)
    })

    it('does not steal Enter shortcuts from focused interactive controls', async () => {
        const { goToAdvancedSearch, openRow } = renderKeyboardHook()
        const button = document.createElement('button')

        document.body.appendChild(button)

        try {
            await act(async () => {
                fireEvent.keyDown(button, { key: 'Enter' })
            })

            act(() => {
                fireEvent.keyDown(button, { key: 'Enter', shiftKey: true })
            })

            expect(openRow).not.toHaveBeenCalled()
            expect(goToAdvancedSearch).not.toHaveBeenCalled()
        } finally {
            button.remove()
        }
    })

    it('does not bind keyboard behavior when the spotlight is closed', () => {
        const { result } = renderKeyboardHook({ isOpen: false })

        act(() => {
            fireEvent.keyDown(document, { key: 'ArrowDown' })
        })

        expect(result.current.selectedIndex).toBe(0)
    })
})
