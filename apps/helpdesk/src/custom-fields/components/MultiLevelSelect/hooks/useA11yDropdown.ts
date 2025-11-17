import type { RefObject } from 'react'
import { useCallback, useEffect, useRef } from 'react'

import { PREVIOUS_BUTTON_ID } from '../constants'

export function useA11yDropdown({
    isActive,
    setActive,
    currentPath,
    inputRef,
    modalRef,
}: {
    isActive: boolean
    setActive: (nextIsActive: boolean) => void
    currentPath: string[]
    inputRef: RefObject<HTMLInputElement>
    modalRef: RefObject<HTMLDivElement>
}) {
    const modalButtonsRef = useRef<HTMLButtonElement[]>([])
    const searchInputRef = useRef<HTMLInputElement | null>(null)

    const handleActive = useCallback(
        (nextIsActive: boolean) => {
            if (!nextIsActive) {
                // focus needs to be done before setting active to false
                inputRef.current?.focus()
                inputRef.current?.blur()
            }
            setActive(nextIsActive)
        },
        [setActive, inputRef],
    )

    useEffect(() => {
        let currentModalRef: HTMLDivElement | null = null
        const handleModalKeyDown = handleModalKeyDownBuilder({
            handleActive,
            modalButtonsRef,
            searchInputRef,
        })
        if (isActive) {
            // we need to wait for the ref to update itself :/
            window.setTimeout(() => {
                currentModalRef = modalRef.current
                if (currentModalRef) {
                    modalButtonsRef.current = Array.from(
                        currentModalRef.querySelectorAll('button'),
                    )
                    searchInputRef.current =
                        currentModalRef.querySelector('input')
                    if (isPreviousButton(modalButtonsRef.current[0])) {
                        modalButtonsRef.current[1]?.focus()
                    } else if (searchInputRef.current) {
                        searchInputRef.current.focus()
                    } else {
                        modalButtonsRef.current[0].focus()
                    }

                    currentModalRef.addEventListener(
                        'keydown',
                        handleModalKeyDown,
                    )
                }
            }, 0)
        }
        return () => {
            currentModalRef?.removeEventListener('keydown', handleModalKeyDown)
        }
    }, [
        currentPath,
        isActive,
        handleActive,
        modalRef,
        modalButtonsRef,
        searchInputRef,
    ])
}

function isPreviousButton(button: HTMLButtonElement) {
    return button?.id === PREVIOUS_BUTTON_ID
}

function handleModalKeyDownBuilder({
    handleActive,
    modalButtonsRef,
    searchInputRef,
}: {
    handleActive: (nextIsActive: boolean) => void
    modalButtonsRef: RefObject<HTMLButtonElement[]>
    searchInputRef: RefObject<HTMLInputElement | null>
}) {
    return function handleKeyDown(evt: KeyboardEvent) {
        const activeElement = document.activeElement
        const modalButtons = modalButtonsRef.current
        const searchInput = searchInputRef.current

        if (!modalButtons) return
        switch (evt.key) {
            case 'Escape':
                evt.stopPropagation()
                handleActive(false)
                break
            case 'Tab':
                if (evt.shiftKey) {
                    /**
                     * We want to ensure that the user can close the modal when
                     * tabbing backwards from the first focusable element in the
                     * modal
                     */
                    if (
                        (activeElement === modalButtons[0] &&
                            isPreviousButton(modalButtons[0])) ||
                        (activeElement === modalButtons[0] && !searchInput) ||
                        (activeElement === searchInput &&
                            !isPreviousButton(modalButtons[0]))
                    ) {
                        evt.preventDefault()
                        handleActive(false)
                    }
                } else {
                    if (
                        modalButtons[modalButtons.length - 1] === activeElement
                    ) {
                        evt.preventDefault()
                        handleActive(false)
                    }
                }
                break
            case 'ArrowRight':
                evt.stopPropagation()
                if (activeElement?.nodeName === 'BUTTON') {
                    ;(activeElement as HTMLButtonElement).click()
                }
                break
            case 'ArrowLeft':
                evt.stopPropagation()
                if (isPreviousButton(modalButtons[0])) {
                    modalButtons[0]?.click()
                }
                break
        }
    }
}
