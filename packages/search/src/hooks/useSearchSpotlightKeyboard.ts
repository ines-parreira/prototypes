import { useCallback, useEffect } from 'react'

import { isMacOs } from '@repo/utils'

import type { SearchRow } from '../types'

type UseSearchSpotlightKeyboardParams = {
    flatRows: Array<{ globalIndex: number; row: SearchRow }>
    goToAdvancedSearch: () => void
    isOpen: boolean
    openRow: (row: SearchRow, openInNewTab: boolean) => Promise<void>
    onKeyboardSelectionChange: () => void
    selectedIndex: number
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
}

function isInteractiveShortcutTarget(target: EventTarget | null) {
    if (!(target instanceof Element)) {
        return false
    }

    return Boolean(
        target.closest(
            'button, a, [role="button"], [role="link"], [role="tab"]',
        ),
    )
}

export function useSearchSpotlightKeyboard({
    flatRows,
    goToAdvancedSearch,
    isOpen,
    openRow,
    onKeyboardSelectionChange,
    selectedIndex,
    setSelectedIndex,
}: UseSearchSpotlightKeyboardParams) {
    const handleKeyDown = useCallback(
        async (
            event: Pick<
                KeyboardEvent,
                | 'ctrlKey'
                | 'key'
                | 'metaKey'
                | 'preventDefault'
                | 'shiftKey'
                | 'target'
            >,
        ) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault()
                if (flatRows.length === 0) {
                    return
                }
                onKeyboardSelectionChange()
                setSelectedIndex((current) => (current + 1) % flatRows.length)
                return
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault()
                if (flatRows.length === 0) {
                    return
                }
                onKeyboardSelectionChange()
                setSelectedIndex((current) =>
                    current === 0 ? flatRows.length - 1 : current - 1,
                )
                return
            }

            if (event.key === 'Enter' && event.shiftKey) {
                if (isInteractiveShortcutTarget(event.target)) {
                    return
                }

                event.preventDefault()
                goToAdvancedSearch()
                return
            }

            if (event.key === 'Enter') {
                if (isInteractiveShortcutTarget(event.target)) {
                    return
                }

                event.preventDefault()

                const selectedRow = flatRows[selectedIndex]
                if (!selectedRow) {
                    return
                }
                await openRow(
                    selectedRow.row,
                    (isMacOs && event.metaKey) || (!isMacOs && event.ctrlKey),
                )
            }
        },
        [
            flatRows,
            goToAdvancedSearch,
            openRow,
            onKeyboardSelectionChange,
            selectedIndex,
            setSelectedIndex,
        ],
    )

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const handleDocumentKeyDown = (event: KeyboardEvent) => {
            void handleKeyDown(event)
        }

        document.addEventListener('keydown', handleDocumentKeyDown, true)

        return () => {
            document.removeEventListener('keydown', handleDocumentKeyDown, true)
        }
    }, [handleKeyDown, isOpen])
}
