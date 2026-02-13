import type { KeyboardEvent, MouseEvent } from 'react'
import React, { useCallback, useEffect, useRef } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import type { FindReplaceStore } from './index'

import css from './FindReplaceDialog.less'

type Props = {
    store: Omit<FindReplaceStore, 'shouldScrollToMatch'>
    onSearchChange: (term: string) => void
    onReplaceChange: (term: string) => void
    onFindNext: () => void
    onFindPrevious: () => void
    onReplace: () => void
    onReplaceAll: () => void
    onClose: () => void
    onToggleReplace: () => void
}

const FindReplaceDialog = ({
    store,
    onSearchChange,
    onReplaceChange,
    onFindNext,
    onFindPrevious,
    onReplace,
    onReplaceAll,
    onClose,
    onToggleReplace,
}: Props) => {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const replaceInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (store.isOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [store.isOpen])

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            event.stopPropagation()

            if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
            } else if (event.key === 'Tab') {
                event.preventDefault()
                const active = document.activeElement
                if (
                    active === searchInputRef.current &&
                    replaceInputRef.current
                ) {
                    replaceInputRef.current.focus()
                } else if (
                    active === replaceInputRef.current &&
                    searchInputRef.current
                ) {
                    searchInputRef.current.focus()
                }
            } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                onFindNext()
            } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                onFindPrevious()
            } else if (event.key === 'Enter') {
                event.preventDefault()
                if (document.activeElement === replaceInputRef.current) {
                    onReplace()
                } else if (event.shiftKey) {
                    onFindPrevious()
                } else {
                    onFindNext()
                }
            }
        },
        [onClose, onFindNext, onFindPrevious, onReplace],
    )

    const handleMouseDown = useCallback((event: MouseEvent) => {
        event.preventDefault()
    }, [])

    if (!store.isOpen) return null

    const matchCountText =
        store.matches.length > 0
            ? `${store.currentMatchIndex + 1} of ${store.matches.length}`
            : store.searchTerm
              ? 'No results'
              : ''

    return (
        <div className={css.findReplaceWrapper}>
            <div
                className={css.findReplaceDialog}
                data-find-replace-dialog
                onMouseDown={handleMouseDown}
                onKeyDown={handleKeyDown}
            >
                <div className={css.findRow}>
                    <button
                        className={css.iconButton}
                        onClick={onToggleReplace}
                        aria-label="Toggle replace"
                    >
                        <span
                            className="material-icons"
                            style={{
                                transition: 'transform 0.2s ease',
                                transform: store.showReplace
                                    ? 'rotate(90deg)'
                                    : undefined,
                            }}
                        >
                            chevron_right
                        </span>
                    </button>
                    <div className={css.inputWrapper}>
                        <input
                            ref={searchInputRef}
                            className={css.input}
                            type="text"
                            placeholder="Find"
                            onChange={(e) => onSearchChange(e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onKeyDown={handleKeyDown}
                        />
                        <span className={css.matchCount}>{matchCountText}</span>
                    </div>

                    <button
                        className={css.iconButton}
                        onClick={onFindPrevious}
                        aria-label="Previous match"
                        disabled={store.matches.length === 0}
                    >
                        <span className="material-icons">
                            keyboard_arrow_up
                        </span>
                    </button>

                    <button
                        className={css.iconButton}
                        onClick={onFindNext}
                        aria-label="Next match"
                        disabled={store.matches.length === 0}
                    >
                        <span className="material-icons">
                            keyboard_arrow_down
                        </span>
                    </button>

                    <button
                        className={css.iconButton}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>
                {store.showReplace && (
                    <div className={css.replaceRow}>
                        <div className={css.chevronSpacer} />
                        <div className={css.inputWrapper}>
                            <input
                                ref={replaceInputRef}
                                className={css.input}
                                type="text"
                                placeholder="Replace with…"
                                onChange={(e) =>
                                    onReplaceChange(e.target.value)
                                }
                                onMouseDown={(e) => e.stopPropagation()}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <Tooltip delay={0} placement="bottom">
                            <TooltipTrigger>
                                <button
                                    className={css.iconButton}
                                    onClick={onReplace}
                                    aria-label="Replace"
                                    disabled={store.matches.length === 0}
                                >
                                    <span className="material-icons">
                                        find_replace
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent caption="Replace" />
                        </Tooltip>
                        <Tooltip delay={0} placement="bottom">
                            <TooltipTrigger>
                                <button
                                    className={css.iconButton}
                                    onClick={onReplaceAll}
                                    aria-label="Replace all"
                                    disabled={store.matches.length === 0}
                                >
                                    <span className="material-icons">
                                        swap_horiz
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent caption="Replace all" />
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FindReplaceDialog
