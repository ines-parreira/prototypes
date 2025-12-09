import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../../tests/render.utils'
import { useEditableBreadcrumb } from '../useEditableBreadcrumb'

describe('useEditableBreadcrumb', () => {
    let mockElement: HTMLSpanElement

    beforeEach(() => {
        mockElement = document.createElement('span')
        mockElement.contentEditable = 'true'
        document.body.appendChild(mockElement)

        if (!document.execCommand) {
            document.execCommand = vi.fn(() => true) as unknown as (
                commandId: string,
                showUI?: boolean,
                value?: string,
            ) => boolean
        }
    })

    afterEach(() => {
        document.body.removeChild(mockElement)
    })

    describe('handleFocus', () => {
        it('should set focusMethod to "mouse" when wasMouseDownRef is true', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement

            act(() => {
                result.current.handleMouseDown()
                result.current.handleFocus()
            })

            expect(mockElement.dataset.focusMethod).toBe('mouse')
        })

        it('should set focusMethod to "keyboard" when wasMouseDownRef is false', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement

            act(() => {
                result.current.handleFocus()
            })

            expect(mockElement.dataset.focusMethod).toBe('keyboard')
        })
    })

    describe('handleBlur', () => {
        it('should remove focusMethod from dataset', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.dataset.focusMethod = 'mouse'

            act(() => {
                result.current.handleBlur()
            })

            expect(mockElement.dataset.focusMethod).toBeUndefined()
        })

        it('should call onChange with new value when text changes', () => {
            const onChange = vi.fn()
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'original', onChange }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.textContent = 'updated'

            act(() => {
                result.current.handleBlur()
            })

            expect(onChange).toHaveBeenCalledWith('updated')
        })

        it('should not call onChange when text has not changed', () => {
            const onChange = vi.fn()
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.textContent = 'test'

            act(() => {
                result.current.handleBlur()
            })

            expect(onChange).not.toHaveBeenCalled()
        })

        it('should handle empty textContent', () => {
            const onChange = vi.fn()
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.textContent = ''

            act(() => {
                result.current.handleBlur()
            })

            expect(onChange).toHaveBeenCalledWith('')
        })

        it('should scroll to the start of the text when blurring', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.scrollLeft = 100

            act(() => {
                result.current.handleBlur()
            })

            expect(mockElement.scrollLeft).toBe(0)
        })
    })

    describe('handlePaste', () => {
        it('should prevent default paste behavior', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            const mockClipboardData = {
                getData: vi.fn().mockReturnValue('pasted text'),
            }
            const event = {
                preventDefault: vi.fn(),
                clipboardData: mockClipboardData,
            } as unknown as React.ClipboardEvent

            const execCommandSpy = vi.fn(() => true)
            document.execCommand = execCommandSpy as unknown as (
                commandId: string,
                showUI?: boolean,
                value?: string,
            ) => boolean

            act(() => {
                result.current.handlePaste(event)
            })

            expect(event.preventDefault).toHaveBeenCalled()
            expect(execCommandSpy).toHaveBeenCalledWith(
                'insertText',
                false,
                'pasted text',
            )
        })

        it('should normalize pasted text by removing newlines', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            const mockClipboardData = {
                getData: vi.fn().mockReturnValue('line1\nline2\r\nline3'),
            }
            const event = {
                preventDefault: vi.fn(),
                clipboardData: mockClipboardData,
            } as unknown as React.ClipboardEvent

            const execCommandSpy = vi.fn(() => true)
            document.execCommand = execCommandSpy as unknown as (
                commandId: string,
                showUI?: boolean,
                value?: string,
            ) => boolean

            act(() => {
                result.current.handlePaste(event)
            })

            expect(execCommandSpy).toHaveBeenCalledWith(
                'insertText',
                false,
                'line1 line2 line3',
            )
        })

        it('should trim whitespace from pasted text', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            const mockClipboardData = {
                getData: vi.fn().mockReturnValue('  text with spaces  '),
            }
            const event = {
                preventDefault: vi.fn(),
                clipboardData: mockClipboardData,
            } as unknown as React.ClipboardEvent

            const execCommandSpy = vi.fn(() => true)
            document.execCommand = execCommandSpy as unknown as (
                commandId: string,
                showUI?: boolean,
                value?: string,
            ) => boolean

            act(() => {
                result.current.handlePaste(event)
            })

            expect(execCommandSpy).toHaveBeenCalledWith(
                'insertText',
                false,
                'text with spaces',
            )
        })
    })

    describe('handleKeyDown', () => {
        it('should prevent default and blur element when Enter is pressed', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            const blurSpy = vi.spyOn(mockElement, 'blur')

            const event = {
                key: 'Enter',
                preventDefault: vi.fn(),
            } as unknown as React.KeyboardEvent

            act(() => {
                result.current.handleKeyDown(event)
            })

            expect(event.preventDefault).toHaveBeenCalled()
            expect(blurSpy).toHaveBeenCalled()
        })

        it('should not prevent default for other keys', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            const event = {
                key: 'a',
                preventDefault: vi.fn(),
            } as unknown as React.KeyboardEvent

            act(() => {
                result.current.handleKeyDown(event)
            })

            expect(event.preventDefault).not.toHaveBeenCalled()
        })
    })

    describe('handleInput', () => {
        it('should normalize text by removing newlines', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            const textNode = document.createTextNode('line1\nline2')
            mockElement.appendChild(textNode)

            const mockSelection = {
                getRangeAt: vi.fn().mockReturnValue({
                    startOffset: 5,
                }),
                removeAllRanges: vi.fn(),
                addRange: vi.fn(),
            }
            vi.spyOn(window, 'getSelection').mockReturnValue(
                mockSelection as unknown as Selection,
            )

            act(() => {
                result.current.handleInput()
            })

            expect(mockElement.textContent).toBe('line1 line2')
        })

        it('should preserve cursor position when normalizing', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            const textNode = document.createTextNode('text\nhere')
            mockElement.appendChild(textNode)

            const mockRange = {
                startOffset: 5,
                setStart: vi.fn(),
                collapse: vi.fn(),
            }
            const mockSelection = {
                getRangeAt: vi.fn().mockReturnValue(mockRange),
                removeAllRanges: vi.fn(),
                addRange: vi.fn(),
            }
            vi.spyOn(window, 'getSelection').mockReturnValue(
                mockSelection as unknown as Selection,
            )
            vi.spyOn(document, 'createRange').mockReturnValue(
                mockRange as unknown as Range,
            )

            act(() => {
                result.current.handleInput()
            })

            expect(mockRange.setStart).toHaveBeenCalled()
            expect(mockRange.collapse).toHaveBeenCalledWith(true)
            expect(mockSelection.removeAllRanges).toHaveBeenCalled()
            expect(mockSelection.addRange).toHaveBeenCalled()
        })

        it('should not modify text if no normalization is needed', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.textContent = 'normal text'
            const originalContent = mockElement.textContent

            act(() => {
                result.current.handleInput()
            })

            expect(mockElement.textContent).toBe(originalContent)
        })
    })

    describe('handleEditClick', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.useRealTimers()
        })

        it('should focus the element and select all text', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            const focusSpy = vi.spyOn(mockElement, 'focus')
            const textNode = document.createTextNode('test text')
            mockElement.appendChild(textNode)

            const mockRange = {
                selectNodeContents: vi.fn(),
                collapse: vi.fn(),
            }
            const mockSelection = {
                removeAllRanges: vi.fn(),
                addRange: vi.fn(),
            }
            vi.spyOn(document, 'createRange').mockReturnValue(
                mockRange as unknown as Range,
            )
            vi.spyOn(window, 'getSelection').mockReturnValue(
                mockSelection as unknown as Selection,
            )

            act(() => {
                result.current.handleEditClick()
            })

            expect(focusSpy).toHaveBeenCalled()

            act(() => {
                vi.runAllTimers()
            })

            expect(mockRange.selectNodeContents).toHaveBeenCalledWith(
                mockElement,
            )
            expect(mockRange.collapse).toHaveBeenCalledWith(false)
            expect(mockSelection.removeAllRanges).toHaveBeenCalled()
            expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange)
        })

        it('should scroll to end of text', () => {
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: 'test', onChange: vi.fn() }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            Object.defineProperty(mockElement, 'scrollWidth', {
                value: 200,
                writable: true,
            })
            Object.defineProperty(mockElement, 'scrollLeft', {
                value: 0,
                writable: true,
            })

            const mockRange = {
                selectNodeContents: vi.fn(),
                collapse: vi.fn(),
            }
            const mockSelection = {
                removeAllRanges: vi.fn(),
                addRange: vi.fn(),
            }
            vi.spyOn(document, 'createRange').mockReturnValue(
                mockRange as unknown as Range,
            )
            vi.spyOn(window, 'getSelection').mockReturnValue(
                mockSelection as unknown as Selection,
            )

            act(() => {
                result.current.handleEditClick()
            })

            act(() => {
                vi.runAllTimers()
            })

            expect(mockElement.scrollLeft).toBe(200)
        })
    })

    describe('value handling', () => {
        it('should handle null value', () => {
            const onChange = vi.fn()
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: null, onChange }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.textContent = 'new text'

            act(() => {
                result.current.handleBlur()
            })

            expect(onChange).toHaveBeenCalledWith('new text')
        })

        it('should not call onChange when empty value stays empty', () => {
            const onChange = vi.fn()
            const { result } = renderHook(() =>
                useEditableBreadcrumb({ value: null, onChange }),
            )

            // @ts-expect-error
            result.current.subjectRef.current = mockElement
            mockElement.textContent = ''

            act(() => {
                result.current.handleBlur()
            })

            expect(onChange).not.toHaveBeenCalled()
        })
    })
})
