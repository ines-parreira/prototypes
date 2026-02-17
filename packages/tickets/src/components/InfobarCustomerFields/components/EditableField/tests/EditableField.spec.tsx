import React from 'react'

import { act, waitFor } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { EditableField } from '../EditableField'

let mockIsMacOs = false

vi.mock('@repo/utils', () => ({
    get isMacOs() {
        return mockIsMacOs
    },
}))

const mockValidator = vi.fn((value: string) => {
    if (!value.includes('@')) {
        return 'Invalid email address'
    }
    return undefined
})

describe('EditableField', () => {
    it('should render TextField with placeholder when no value', () => {
        const onValueChange = vi.fn()

        const { getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                placeholder="+ Add note"
            />,
        )

        expect(getByPlaceholderText('+ Add note')).toBeInTheDocument()
    })

    it('should render TextField with value', () => {
        const onValueChange = vi.fn()

        const { getByDisplayValue } = render(
            <EditableField
                value="Test value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        expect(getByDisplayValue('Test value')).toBeInTheDocument()
    })

    it('should call onValueChange on every keystroke', async () => {
        const onValueChange = vi.fn()

        const { user, getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        await act(() => user.type(input, 'New'))

        await waitFor(() => {
            expect(onValueChange).toHaveBeenCalled()
            expect(onValueChange.mock.calls.length).toBeGreaterThan(0)
        })
    })

    it('should not call onValueChange when empty value is submitted and current value is also empty', async () => {
        const onValueChange = vi.fn()

        const { user, getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        await act(() => user.click(input))
        await act(() => user.tab())

        expect(onValueChange).not.toHaveBeenCalled()
    })

    it('should trim whitespace on blur', async () => {
        const ControlledField = () => {
            const [value, setValue] = React.useState('')
            return (
                <EditableField
                    value={value}
                    onValueChange={setValue}
                    placeholder="+ Add"
                />
            )
        }

        const { user, getByPlaceholderText } = render(<ControlledField />)

        const input = getByPlaceholderText('+ Add')

        await act(() => user.type(input, '  New value  '))
        await act(() => user.tab())

        await waitFor(() => {
            expect(input).toHaveValue('New value')
        })
    })

    it('should show validation error when validator returns error message on blur', async () => {
        const onValueChange = vi.fn()

        const { user, getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                validator={mockValidator}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        await act(() => user.type(input, 'invalid-email'))

        expect(input).toHaveAttribute('aria-invalid', 'false')

        await act(() => user.tab())

        await waitFor(() => {
            expect(input).toHaveAttribute('aria-invalid', 'true')
        })
    })

    it('should clear validation error when user starts typing', async () => {
        const onValueChange = vi.fn()

        const { user, getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                validator={mockValidator}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        await act(() => user.type(input, 'invalid'))
        await act(() => user.tab())

        await waitFor(() => {
            expect(input).toHaveAttribute('aria-invalid', 'true')
        })

        await act(() => user.click(input))
        await act(() => user.type(input, '@'))

        await waitFor(() => {
            expect(input).toHaveAttribute('aria-invalid', 'false')
        })
    })

    it('should call onValueChange during typing and pass validation on blur', async () => {
        const ControlledField = () => {
            const [value, setValue] = React.useState('')
            return (
                <EditableField
                    value={value}
                    onValueChange={setValue}
                    validator={mockValidator}
                    placeholder="+ Add"
                />
            )
        }

        const { user, getByPlaceholderText } = render(<ControlledField />)

        const input = getByPlaceholderText('+ Add')

        await act(() => user.type(input, 'new@example.com'))
        await act(() => user.tab())

        await waitFor(() => {
            expect(mockValidator).toHaveBeenLastCalledWith('new@example.com')
            expect(input).toHaveAttribute('aria-invalid', 'false')
        })
    })

    it('should update input value when prop value changes', () => {
        const onValueChange = vi.fn()

        const { rerender, getByDisplayValue } = render(
            <EditableField
                value="Initial value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        expect(getByDisplayValue('Initial value')).toBeInTheDocument()

        rerender(
            <EditableField
                value="Updated value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        expect(getByDisplayValue('Updated value')).toBeInTheDocument()
    })

    describe('Keyboard shortcuts', () => {
        it('should blur text field on Enter', async () => {
            const onBlur = vi.fn()
            const ControlledField = () => {
                const [value, setValue] = React.useState('')
                return (
                    <EditableField
                        value={value}
                        onValueChange={setValue}
                        validator={mockValidator}
                        onBlur={onBlur}
                        placeholder="+ Add"
                    />
                )
            }

            const { user, getByPlaceholderText } = render(<ControlledField />)

            const input = getByPlaceholderText('+ Add')

            await act(() => user.type(input, 'test@example.com'))

            expect(input).toHaveFocus()

            await act(() => user.keyboard('{Enter}'))

            await waitFor(() => {
                expect(input).not.toHaveFocus()
                expect(onBlur).toHaveBeenCalledWith('test@example.com')
            })
        })

        it('should not blur text field on Enter when value is invalid', async () => {
            const onBlur = vi.fn()

            const ControlledField = () => {
                const [value, setValue] = React.useState('')
                return (
                    <EditableField
                        value={value}
                        onValueChange={setValue}
                        validator={mockValidator}
                        onBlur={onBlur}
                        placeholder="+ Add"
                    />
                )
            }

            const { user, getByPlaceholderText } = render(<ControlledField />)

            const input = getByPlaceholderText('+ Add')

            await act(() => user.type(input, 'invalid-email'))

            expect(input).toHaveFocus()

            await act(() => user.keyboard('{Enter}'))

            await waitFor(() => {
                expect(input).toHaveFocus()
                expect(input).toHaveAttribute('aria-invalid', 'true')
                expect(onBlur).not.toHaveBeenCalled()
            })
        })

        describe('Textarea on non-macOS platforms', () => {
            const ControlledField = () => {
                const [value, setValue] = React.useState('')
                return (
                    <EditableField
                        type="textarea"
                        value={value}
                        onValueChange={setValue}
                        placeholder="+ Add note"
                    />
                )
            }

            beforeEach(() => {
                mockIsMacOs = false
            })

            it('should blur textarea on Ctrl+Enter', async () => {
                const { user, getByPlaceholderText } = render(
                    <ControlledField />,
                )

                const textarea = getByPlaceholderText('+ Add note')

                await act(() => user.type(textarea, '  Note text  '))

                expect(textarea).toHaveFocus()

                await act(() => user.keyboard('{Control>}{Enter}{/Control}'))

                await waitFor(() => {
                    expect(textarea).not.toHaveFocus()
                })
            })

            it('should not blur textarea on Meta+Enter', async () => {
                const { user, getByPlaceholderText } = render(
                    <ControlledField />,
                )

                const textarea = getByPlaceholderText('+ Add note')

                await act(() => user.type(textarea, 'Note text'))

                expect(textarea).toHaveFocus()

                await act(() => user.keyboard('{Meta>}{Enter}{/Meta}'))

                await waitFor(() => {
                    expect(textarea).toHaveFocus()
                })
            })
        })

        describe('Textarea on macOS', () => {
            beforeEach(() => {
                mockIsMacOs = true
            })

            afterEach(() => {
                mockIsMacOs = false
            })

            const ControlledField = () => {
                const [value, setValue] = React.useState('')
                return (
                    <EditableField
                        type="textarea"
                        value={value}
                        onValueChange={setValue}
                        placeholder="+ Add note"
                    />
                )
            }

            it('should blur textarea on Cmd+Enter (Meta+Enter)', async () => {
                const { user, getByPlaceholderText } = render(
                    <ControlledField />,
                )

                const textarea = getByPlaceholderText('+ Add note')

                await act(() => user.type(textarea, '  Note text  '))

                expect(textarea).toHaveFocus()

                await act(() => user.keyboard('{Meta>}{Enter}{/Meta}'))

                await waitFor(() => {
                    expect(textarea).not.toHaveFocus()
                    expect(textarea).toHaveValue('Note text')
                })
            })

            it('should not blur textarea on Ctrl+Enter', async () => {
                const { user, getByPlaceholderText } = render(
                    <ControlledField />,
                )

                const textarea = getByPlaceholderText('+ Add note')

                await act(() => user.type(textarea, 'Note text'))

                expect(textarea).toHaveFocus()

                await act(() => user.keyboard('{Control>}{Enter}{/Control}'))

                await waitFor(() => {
                    expect(textarea).toHaveFocus()
                })
            })
        })
    })

    describe('NumberField', () => {
        it('should render large numbers without grouping separators', () => {
            const onValueChange = vi.fn()

            const { getByDisplayValue, queryByDisplayValue } = render(
                <EditableField
                    type="number"
                    value={100000123}
                    onValueChange={onValueChange}
                    placeholder="+ Add number"
                />,
            )

            expect(getByDisplayValue('100000123')).toBeInTheDocument()
            expect(queryByDisplayValue('100,000,123')).not.toBeInTheDocument()
        })
    })

    describe('Tooltip', () => {
        describe('TextField', () => {
            it('should not show tooltip when showTooltip is false', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText, queryByText } = render(
                    <EditableField
                        value="Test value"
                        onValueChange={onValueChange}
                        placeholder="+ Add"
                        showTooltip={false}
                    />,
                )

                const input = getByPlaceholderText('+ Add')
                await user.hover(input)

                expect(queryByText('Test value')).not.toBeInTheDocument()
            })

            it('should show tooltip when showTooltip is true', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText, getByText } = render(
                    <EditableField
                        value="Test value"
                        onValueChange={onValueChange}
                        placeholder="+ Add"
                        showTooltip
                    />,
                )

                const input = getByPlaceholderText('+ Add')
                await user.hover(input)

                await waitFor(() => {
                    expect(getByText('Test value')).toBeInTheDocument()
                })

                const tooltipTexts = document.querySelectorAll(
                    '[data-name="tooltip-content"]',
                )
                expect(tooltipTexts.length).toBe(1)
            })

            it('should hide tooltip when field is focused', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText, queryByText } = render(
                    <EditableField
                        value="Test value"
                        onValueChange={onValueChange}
                        placeholder="+ Add"
                        showTooltip
                    />,
                )

                const input = getByPlaceholderText('+ Add')
                await user.hover(input)

                await waitFor(() => {
                    expect(queryByText('Test value')).toBeInTheDocument()
                })

                await user.click(input)

                await waitFor(() => {
                    expect(queryByText('Test value')).not.toBeInTheDocument()
                })
            })

            it('should not show tooltip when value is empty', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        value=""
                        onValueChange={onValueChange}
                        placeholder="+ Add"
                        showTooltip
                    />,
                )

                const input = getByPlaceholderText('+ Add')
                await user.hover(input)

                const tooltipTexts = document.querySelectorAll(
                    '[data-name="tooltip-content"]',
                )
                expect(tooltipTexts.length).toBe(0)
            })
        })

        describe('NumberField', () => {
            it('should strip leading hash from pasted numeric value', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="number"
                        value={undefined}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                    />,
                )

                const input = getByPlaceholderText('+ Add number')

                await act(() => user.click(input))
                await act(() => user.paste('#12345'))

                expect(onValueChange).toHaveBeenCalledWith(12345)
            })

            it('should strip leading hash and whitespace from pasted numeric value', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="number"
                        value={undefined}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                    />,
                )

                const input = getByPlaceholderText('+ Add number')

                await act(() => user.click(input))
                await act(() => user.paste('#   12345'))

                expect(onValueChange).toHaveBeenCalledWith(12345)
            })

            it('should not normalize pasted value when it does not start with hash', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="number"
                        value={undefined}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                    />,
                )

                const input = getByPlaceholderText('+ Add number')

                await act(() => user.click(input))
                await act(() => user.paste('order-12345'))

                expect(onValueChange).not.toHaveBeenCalled()
            })

            it('should not normalize pasted value when hash has no numeric content', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="number"
                        value={undefined}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                    />,
                )

                const input = getByPlaceholderText('+ Add number')

                await act(() => user.click(input))
                await act(() => user.paste('#'))

                expect(onValueChange).not.toHaveBeenCalled()
            })

            it('should not normalize pasted value when hash value is non numeric', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="number"
                        value={undefined}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                    />,
                )

                const input = getByPlaceholderText('+ Add number')

                await act(() => user.click(input))
                await act(() => user.paste('#abc'))

                expect(onValueChange).not.toHaveBeenCalled()
            })
            it('should not show tooltip when showTooltip is false', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText, queryByText } = render(
                    <EditableField
                        type="number"
                        value={42}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                        showTooltip={false}
                    />,
                )

                const input = getByPlaceholderText('+ Add number')
                await user.hover(input)

                expect(queryByText('42')).not.toBeInTheDocument()
            })

            it('should show tooltip when showTooltip is true', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText, getByText } = render(
                    <EditableField
                        type="number"
                        value={42}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                        showTooltip
                    />,
                )

                const input = getByPlaceholderText('+ Add number')
                await user.hover(input)

                await waitFor(() => {
                    expect(getByText('42')).toBeInTheDocument()
                })

                const tooltipTexts = document.querySelectorAll(
                    '[data-name="tooltip-content"]',
                )
                expect(tooltipTexts.length).toBe(1)
            })

            it('should hide tooltip when field is focused', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText, queryByText } = render(
                    <EditableField
                        type="number"
                        value={42}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                        showTooltip
                    />,
                )

                const input = getByPlaceholderText('+ Add number')
                await user.hover(input)

                await waitFor(() => {
                    expect(queryByText('42')).toBeInTheDocument()
                })

                await user.click(input)

                await waitFor(() => {
                    expect(queryByText('42')).not.toBeInTheDocument()
                })
            })

            it('should not show tooltip when value is undefined', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="number"
                        value={undefined}
                        onValueChange={onValueChange}
                        placeholder="+ Add number"
                        showTooltip
                    />,
                )

                const input = getByPlaceholderText('+ Add number')
                await user.hover(input)

                const tooltipTexts = document.querySelectorAll(
                    '[data-name="tooltip-content"]',
                )
                expect(tooltipTexts.length).toBe(0)
            })
        })

        describe('TextAreaField', () => {
            it('should not show tooltip when showTooltip is false', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="textarea"
                        value="Test note"
                        onValueChange={onValueChange}
                        placeholder="+ Add note"
                        showTooltip={false}
                    />,
                )

                const textarea = getByPlaceholderText('+ Add note')
                await user.hover(textarea)

                const tooltipContent = document.querySelector(
                    '[data-name="tooltip-content"]',
                )
                expect(tooltipContent).not.toBeInTheDocument()
            })

            it('should show tooltip when showTooltip is true', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="textarea"
                        value="Test note"
                        onValueChange={onValueChange}
                        placeholder="+ Add note"
                        showTooltip
                    />,
                )

                const textarea = getByPlaceholderText('+ Add note')
                await user.hover(textarea)

                await waitFor(() => {
                    const tooltipContent = document.querySelector(
                        '[data-name="tooltip-content"]',
                    )
                    expect(tooltipContent).toBeInTheDocument()
                    expect(tooltipContent?.textContent).toContain('Test note')
                })

                const tooltipTexts = document.querySelectorAll(
                    '[data-name="tooltip-content"]',
                )
                expect(tooltipTexts.length).toBe(1)
            })

            it('should hide tooltip when field is focused', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="textarea"
                        value="Test note"
                        onValueChange={onValueChange}
                        placeholder="+ Add note"
                        showTooltip
                    />,
                )

                const textarea = getByPlaceholderText('+ Add note')
                await user.hover(textarea)

                await waitFor(() => {
                    const tooltipContent = document.querySelector(
                        '[data-name="tooltip-content"]',
                    )
                    expect(tooltipContent).toBeInTheDocument()
                })

                await user.click(textarea)

                await waitFor(() => {
                    const tooltipContent = document.querySelector(
                        '[data-name="tooltip-content"]',
                    )
                    expect(tooltipContent).not.toBeInTheDocument()
                })
            })

            it('should not show tooltip when value is empty', async () => {
                const onValueChange = vi.fn()

                const { user, getByPlaceholderText } = render(
                    <EditableField
                        type="textarea"
                        value=""
                        onValueChange={onValueChange}
                        placeholder="+ Add note"
                        showTooltip
                    />,
                )

                const textarea = getByPlaceholderText('+ Add note')
                await user.hover(textarea)

                const tooltipTexts = document.querySelectorAll(
                    '[data-name="tooltip-content"]',
                )
                expect(tooltipTexts.length).toBe(0)
            })
        })
    })
})
