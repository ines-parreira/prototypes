import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SeoMetaTitle } from './SeoMetaTitle'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useTextWidth: jest.fn((text: string) => {
        return text ? text.length * 10 + 20 : 20
    }),
}))

describe('SeoMetaTitle', () => {
    const defaultProps = {
        title: 'How to Process Returns',
        metaTitle: 'Custom Meta Title',
        onChangeMetaTitle: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Initial rendering', () => {
        it('should render checkbox with correct label', () => {
            render(<SeoMetaTitle {...defaultProps} />)

            expect(
                screen.getByRole('checkbox', {
                    name: /use current title as meta title/i,
                }),
            ).toBeInTheDocument()
        })

        it('should render checkbox as unchecked when metaTitle differs from title', () => {
            render(<SeoMetaTitle {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox', {
                name: /use current title as meta title/i,
            })

            expect(checkbox).not.toBeChecked()
        })

        it('should render checkbox as checked when metaTitle is empty', () => {
            render(<SeoMetaTitle {...defaultProps} metaTitle="" />)

            const checkbox = screen.getByRole('checkbox', {
                name: /use current title as meta title/i,
            })

            expect(checkbox).toBeChecked()
        })

        it('should render checkbox as unchecked when metaTitle equals title (has explicit value)', () => {
            render(
                <SeoMetaTitle
                    {...defaultProps}
                    metaTitle="How to Process Returns"
                />,
            )

            const checkbox = screen.getByRole('checkbox', {
                name: /use current title as meta title/i,
            })

            expect(checkbox).not.toBeChecked()
        })

        it('should render input with metaTitle when checkbox is unchecked (metaTitle differs)', () => {
            render(<SeoMetaTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')

            expect(input).toHaveValue('Custom Meta Title')
        })

        it('should render input with article title when checkbox is checked', () => {
            render(<SeoMetaTitle {...defaultProps} metaTitle="" />)

            const input = screen.getByRole('textbox')

            expect(input).toHaveValue('How to Process Returns')
        })

        it('should render disabled input when checkbox is checked', () => {
            render(<SeoMetaTitle {...defaultProps} metaTitle="" />)

            const input = screen.getByRole('textbox')

            expect(input).toBeDisabled()
        })

        it('should render enabled input when checkbox is unchecked', () => {
            render(<SeoMetaTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')

            expect(input).not.toBeDisabled()
        })

        it('should render caption text for search engines', () => {
            render(<SeoMetaTitle {...defaultProps} />)

            expect(
                screen.getByText(
                    /your article´s title displayed in search engines/i,
                ),
            ).toBeInTheDocument()
        })

        it('should not render error message initially', () => {
            render(<SeoMetaTitle {...defaultProps} />)

            expect(
                screen.queryByText(/this field is required/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('Checkbox interaction', () => {
        it('should disable input when checkbox is checked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            await user.click(checkbox)

            await waitFor(() => {
                const input = screen.getByRole('textbox')
                expect(input).toBeDisabled()
            })
        })

        it('should enable input when checkbox is unchecked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} metaTitle="" />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()

            await user.click(checkbox)

            await waitFor(() => {
                const input = screen.getByRole('textbox')
                expect(input).not.toBeDisabled()
            })
        })

        it('should populate input with metaTitle when metaTitle is provided', () => {
            render(
                <SeoMetaTitle
                    {...defaultProps}
                    metaTitle="How to Process Returns"
                />,
            )

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            const input = screen.getByRole('textbox')
            expect(input).toHaveValue('How to Process Returns')
        })

        it('should focus input when checkbox is unchecked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} metaTitle="" />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()

            await user.click(checkbox)

            await waitFor(() => {
                const input = screen.getByRole('textbox')
                expect(input).toHaveFocus()
            })
        })

        it('should switch to article title when checkbox is checked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            const input = screen.getByRole('textbox')
            expect(input).toHaveValue('Custom Meta Title')

            await user.click(checkbox)

            await waitFor(() => {
                expect(input).toHaveValue('How to Process Returns')
            })
        })

        it('should call onChangeMetaTitle with null when checkbox is checked', async () => {
            const user = userEvent.setup()
            const onChangeMetaTitle = jest.fn()
            render(
                <SeoMetaTitle
                    {...defaultProps}
                    onChangeMetaTitle={onChangeMetaTitle}
                />,
            )

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            await user.click(checkbox)

            expect(onChangeMetaTitle).toHaveBeenCalledWith(null)
        })

        it('should not call onChangeMetaTitle when checkbox is unchecked', async () => {
            const user = userEvent.setup()
            const onChangeMetaTitle = jest.fn()
            render(
                <SeoMetaTitle
                    {...defaultProps}
                    metaTitle=""
                    onChangeMetaTitle={onChangeMetaTitle}
                />,
            )

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()

            await user.click(checkbox)

            expect(onChangeMetaTitle).not.toHaveBeenCalled()
        })
    })

    describe('Input field editing', () => {
        it('should allow typing when input is enabled', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')
            expect(input).not.toBeDisabled()

            await user.clear(input)
            await user.type(input, 'New Custom Title')

            expect(input).toHaveValue('New Custom Title')
        })

        it('should call onChangeMetaTitle when typing valid value', async () => {
            const user = userEvent.setup()
            const onChangeMetaTitle = jest.fn()
            render(
                <SeoMetaTitle
                    {...defaultProps}
                    onChangeMetaTitle={onChangeMetaTitle}
                />,
            )

            const input = screen.getByRole('textbox')
            expect(input).not.toBeDisabled()

            await user.clear(input)
            await user.type(input, 'Updated Meta Title')

            expect(onChangeMetaTitle).toHaveBeenCalledWith('Updated Meta Title')
        })

        it('should not call onChangeMetaTitle when input is disabled', () => {
            const onChangeMetaTitle = jest.fn()
            render(
                <SeoMetaTitle
                    {...defaultProps}
                    metaTitle=""
                    onChangeMetaTitle={onChangeMetaTitle}
                />,
            )

            const input = screen.getByRole('textbox')
            expect(input).toBeDisabled()

            expect(onChangeMetaTitle).not.toHaveBeenCalled()
        })
    })

    describe('Validation and error handling', () => {
        it('should show error when input is empty and blurred', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')
            expect(input).not.toBeDisabled()

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })
        })

        it('should clear error when user types valid content', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')
            expect(input).not.toBeDisabled()

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })

            await user.type(input, 'Valid Title')

            await waitFor(() => {
                expect(
                    screen.queryByText(/this field is required/i),
                ).not.toBeInTheDocument()
            })
        })

        it('should not call onChangeMetaTitle when validation fails', async () => {
            const user = userEvent.setup()
            const onChangeMetaTitle = jest.fn()
            render(
                <SeoMetaTitle
                    {...defaultProps}
                    onChangeMetaTitle={onChangeMetaTitle}
                />,
            )

            const input = screen.getByRole('textbox')
            expect(input).not.toBeDisabled()

            await user.clear(input)
            await user.tab()

            expect(onChangeMetaTitle).not.toHaveBeenCalled()
        })

        it('should clear error when checkbox is checked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaTitle {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox')
            const input = screen.getByRole('textbox')
            expect(input).not.toBeDisabled()

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })

            await user.click(checkbox)

            await waitFor(() => {
                expect(
                    screen.queryByText(/this field is required/i),
                ).not.toBeInTheDocument()
            })
        })
    })
})
