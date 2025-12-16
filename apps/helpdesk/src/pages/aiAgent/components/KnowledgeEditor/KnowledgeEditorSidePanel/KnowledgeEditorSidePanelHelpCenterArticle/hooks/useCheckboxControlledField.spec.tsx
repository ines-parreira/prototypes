import { act, renderHook } from '@testing-library/react'

import { useCheckboxControlledField } from './useCheckboxControlledField'

describe('useCheckboxControlledField', () => {
    describe('Initial state', () => {
        it('should initialize with checkbox checked by default', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                }),
            )

            expect(result.current.isChecked).toBe(true)
            expect(result.current.value).toBe('Default Title')
            expect(result.current.isDisabled).toBe(true)
            expect(result.current.isRequired).toBe(false)
            expect(result.current.showError).toBe(false)
            expect(result.current.hasError).toBe(false)
        })

        it('should initialize with checkbox unchecked when defaultChecked is false', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: 'Custom Title',
                    onCommit: jest.fn(),
                    defaultChecked: false,
                }),
            )

            expect(result.current.isChecked).toBe(false)
            expect(result.current.value).toBe('Custom Title')
            expect(result.current.isDisabled).toBe(false)
            expect(result.current.isRequired).toBe(true)
        })

        it('should use defaultValue when checkbox is checked', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Article Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: true,
                }),
            )

            expect(result.current.value).toBe('Article Title')
        })
    })

    describe('Toggling checkbox', () => {
        it('should uncheck checkbox and populate input with draftValue', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: 'Draft Title',
                    onCommit: jest.fn(),
                    defaultChecked: true,
                }),
            )

            expect(result.current.isChecked).toBe(false)
            expect(result.current.value).toBe('Draft Title')
            expect(result.current.isDisabled).toBe(false)
            expect(result.current.isRequired).toBe(true)
        })

        it('should populate input with draftValue when toggling from checked to unchecked', () => {
            const { result } = renderHook(
                ({ draftValue }) =>
                    useCheckboxControlledField({
                        defaultValue: 'Default Title',
                        draftValue,
                        onCommit: jest.fn(),
                        defaultChecked: true,
                    }),
                { initialProps: { draftValue: '' } },
            )

            expect(result.current.isChecked).toBe(true)

            act(() => {
                result.current.toggleChecked()
            })

            expect(result.current.isChecked).toBe(false)
            expect(result.current.value).toBe('')
            expect(result.current.isDisabled).toBe(false)
            expect(result.current.isRequired).toBe(true)
        })

        it('should check checkbox and clear any errors', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleBlur()
            })

            expect(result.current.hasError).toBe(true)

            act(() => {
                result.current.toggleChecked()
            })

            expect(result.current.isChecked).toBe(true)
            expect(result.current.hasError).toBe(false)
            expect(result.current.showError).toBe(false)
        })

        it('should call onCommit with null when checkbox is checked', () => {
            const onCommit = jest.fn()
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: 'Draft Title',
                    onCommit,
                    defaultChecked: false,
                }),
            )

            expect(result.current.isChecked).toBe(false)

            act(() => {
                result.current.toggleChecked()
            })

            expect(result.current.isChecked).toBe(true)
            expect(onCommit).toHaveBeenCalledWith(null)
        })

        it('should not call onCommit when checkbox is unchecked', () => {
            const onCommit = jest.fn()
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit,
                    defaultChecked: true,
                }),
            )

            expect(result.current.isChecked).toBe(true)

            act(() => {
                result.current.toggleChecked()
            })

            expect(result.current.isChecked).toBe(false)
            expect(onCommit).not.toHaveBeenCalled()
        })

        it('should return new checked state from toggleChecked', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: true,
                }),
            )

            let returnValue: boolean

            act(() => {
                returnValue = result.current.toggleChecked()
            })

            expect(returnValue!).toBe(false)
            expect(result.current.isChecked).toBe(false)

            act(() => {
                returnValue = result.current.toggleChecked()
            })

            expect(returnValue!).toBe(true)
            expect(result.current.isChecked).toBe(true)
        })
    })

    describe('Input value changes', () => {
        it('should update input value when user types', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleChange('My Custom Title')
            })

            expect(result.current.value).toBe('My Custom Title')
        })

        it('should clear error when user types non-empty value', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleBlur()
            })

            expect(result.current.hasError).toBe(true)

            act(() => {
                result.current.handleChange('New Title')
            })

            expect(result.current.hasError).toBe(false)
            expect(result.current.showError).toBe(false)
        })

        it('should not clear error when user types only whitespace', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleBlur()
            })

            expect(result.current.hasError).toBe(true)

            act(() => {
                result.current.handleChange('   ')
            })

            expect(result.current.hasError).toBe(true)
        })
    })

    describe('Blur behavior and validation', () => {
        it('should commit value on blur when checkbox is unchecked and input is valid', () => {
            const onCommit = jest.fn()
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit,
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleChange('Custom Meta Title')
            })

            act(() => {
                result.current.handleBlur()
            })

            expect(onCommit).toHaveBeenCalledWith('Custom Meta Title')
            expect(result.current.hasError).toBe(false)
        })

        it('should show error on blur when checkbox is unchecked and input is empty', () => {
            const onCommit = jest.fn()
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit,
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleBlur()
            })

            expect(result.current.hasError).toBe(true)
            expect(result.current.showError).toBe(true)
            expect(onCommit).not.toHaveBeenCalled()
        })

        it('should show error on blur when input contains only whitespace', () => {
            const onCommit = jest.fn()
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit,
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleChange('   ')
            })

            act(() => {
                result.current.handleBlur()
            })

            expect(result.current.hasError).toBe(true)
            expect(result.current.showError).toBe(true)
            expect(onCommit).not.toHaveBeenCalled()
        })

        it('should not commit or validate on blur when checkbox is checked', () => {
            const onCommit = jest.fn()
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit,
                    defaultChecked: true,
                }),
            )

            act(() => {
                result.current.handleBlur()
            })

            expect(result.current.hasError).toBe(false)
            expect(onCommit).not.toHaveBeenCalled()
        })

        it('should handle missing onCommit callback gracefully', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleChange('Some Value')
            })

            expect(() => {
                act(() => {
                    result.current.handleBlur()
                })
            }).not.toThrow()
        })
    })

    describe('Computed properties', () => {
        it('should disable input when checkbox is checked', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: true,
                }),
            )

            expect(result.current.isDisabled).toBe(true)

            act(() => {
                result.current.toggleChecked()
            })

            expect(result.current.isDisabled).toBe(false)
        })

        it('should make input required when checkbox is unchecked', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: true,
                }),
            )

            expect(result.current.isRequired).toBe(false)

            act(() => {
                result.current.toggleChecked()
            })

            expect(result.current.isRequired).toBe(true)
        })

        it('should only show error when checkbox is unchecked and has error', () => {
            const { result } = renderHook(() =>
                useCheckboxControlledField({
                    defaultValue: 'Default Title',
                    draftValue: '',
                    onCommit: jest.fn(),
                    defaultChecked: false,
                }),
            )

            act(() => {
                result.current.handleBlur()
            })

            expect(result.current.hasError).toBe(true)
            expect(result.current.showError).toBe(true)

            act(() => {
                result.current.toggleChecked()
            })

            expect(result.current.hasError).toBe(false)
            expect(result.current.showError).toBe(false)
        })
    })
})
