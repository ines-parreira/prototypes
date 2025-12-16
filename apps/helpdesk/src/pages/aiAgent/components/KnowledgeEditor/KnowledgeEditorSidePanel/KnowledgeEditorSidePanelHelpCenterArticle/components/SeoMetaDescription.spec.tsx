import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SeoMetaDescription } from './SeoMetaDescription'

describe('SeoMetaDescription', () => {
    const defaultProps = {
        defaultDescription: 'How to process returns for your online orders',
        metaDescription: 'Custom meta description for SEO',
        onChangeMetaDescription: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Initial rendering', () => {
        it('should render checkbox with correct label', () => {
            render(<SeoMetaDescription {...defaultProps} />)

            expect(
                screen.getByRole('checkbox', {
                    name: /use as meta description/i,
                }),
            ).toBeInTheDocument()
        })

        it('should render checkbox as unchecked when metaDescription is provided', () => {
            render(<SeoMetaDescription {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox', {
                name: /use as meta description/i,
            })

            expect(checkbox).not.toBeChecked()
        })

        it('should render checkbox as checked when metaDescription is empty', () => {
            render(<SeoMetaDescription {...defaultProps} metaDescription="" />)

            const checkbox = screen.getByRole('checkbox', {
                name: /use as meta description/i,
            })

            expect(checkbox).toBeChecked()
        })

        it('should not render textarea when checkbox is checked', () => {
            render(<SeoMetaDescription {...defaultProps} metaDescription="" />)

            expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
        })

        it('should render textarea when metaDescription is provided (checkbox unchecked)', () => {
            render(<SeoMetaDescription {...defaultProps} />)

            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should not render caption when checkbox is checked', () => {
            render(<SeoMetaDescription {...defaultProps} metaDescription="" />)

            expect(
                screen.queryByText(
                    /article description displayed in search engines/i,
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('Checkbox interaction', () => {
        it('should show textarea when checkbox is unchecked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} metaDescription="" />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()

            await user.click(checkbox)

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })
        })

        it('should populate textarea with metaDescription when it exists', () => {
            render(<SeoMetaDescription {...defaultProps} />)

            const textarea = screen.getByRole('textbox')
            expect(textarea).toHaveValue('Custom meta description for SEO')
        })

        it('should enable textarea when checkbox is unchecked', () => {
            render(<SeoMetaDescription {...defaultProps} />)

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()
            expect(textarea).toBeRequired()
        })

        it('should focus textarea when checkbox is unchecked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} metaDescription="" />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()

            await user.click(checkbox)

            await waitFor(() => {
                const textarea = screen.getByRole('textbox')
                expect(textarea).toHaveFocus()
            })
        })

        it('should show caption when textarea is visible', () => {
            render(<SeoMetaDescription {...defaultProps} />)

            expect(
                screen.getByText(
                    /article description displayed in search engines/i,
                ),
            ).toBeInTheDocument()
        })

        it('should hide textarea when checkbox is checked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            await user.click(checkbox)

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
            })
        })

        it('should call onChangeMetaDescription with null when checkbox is checked', async () => {
            const user = userEvent.setup()
            const onChangeMetaDescription = jest.fn()
            render(
                <SeoMetaDescription
                    {...defaultProps}
                    onChangeMetaDescription={onChangeMetaDescription}
                />,
            )

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            await user.click(checkbox)

            expect(onChangeMetaDescription).toHaveBeenCalledWith(null)
        })
    })

    describe('Textarea field editing', () => {
        it('should allow typing when textarea is enabled', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} />)

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()

            await user.clear(textarea)
            await user.type(textarea, 'New custom description')

            expect(textarea).toHaveValue('New custom description')
        })

        it('should call onChangeMetaDescription on blur with valid value', async () => {
            const user = userEvent.setup()
            const onChangeMetaDescription = jest.fn()
            render(
                <SeoMetaDescription
                    {...defaultProps}
                    onChangeMetaDescription={onChangeMetaDescription}
                />,
            )

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()

            await user.clear(textarea)
            await user.type(textarea, 'Updated meta description')

            await user.tab()

            expect(onChangeMetaDescription).toHaveBeenCalledWith(
                'Updated meta description',
            )
        })

        it('should not call onChangeMetaDescription when textarea is hidden', () => {
            const onChangeMetaDescription = jest.fn()
            render(
                <SeoMetaDescription
                    {...defaultProps}
                    metaDescription=""
                    onChangeMetaDescription={onChangeMetaDescription}
                />,
            )

            expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

            expect(onChangeMetaDescription).not.toHaveBeenCalled()
        })

        it('should have correct textarea attributes', () => {
            render(<SeoMetaDescription {...defaultProps} />)

            const textarea = screen.getByRole('textbox')
            expect(textarea).toHaveAttribute('name', 'excerpt')
            expect(textarea).toHaveAttribute('rows', '2')
        })
    })

    describe('Validation and error handling', () => {
        it('should show error when textarea is empty and blurred', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} />)

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()

            await user.clear(textarea)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })
        })

        it('should clear error when user types valid content', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} />)

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()

            await user.clear(textarea)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })

            await user.type(textarea, 'Valid description')

            await waitFor(() => {
                expect(
                    screen.queryByText(/this field is required/i),
                ).not.toBeInTheDocument()
            })
        })

        it('should not call onChangeMetaDescription when validation fails', async () => {
            const user = userEvent.setup()
            const onChangeMetaDescription = jest.fn()
            render(
                <SeoMetaDescription
                    {...defaultProps}
                    onChangeMetaDescription={onChangeMetaDescription}
                />,
            )

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()

            await user.clear(textarea)
            await user.tab()

            await waitFor(() => {
                expect(onChangeMetaDescription).not.toHaveBeenCalled()
            })
        })

        it('should clear error when checkbox is checked', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox')
            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()

            await user.clear(textarea)
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

    describe('Edge cases', () => {
        it('should handle empty defaultDescription', async () => {
            const user = userEvent.setup()
            render(
                <SeoMetaDescription
                    {...defaultProps}
                    defaultDescription=""
                    metaDescription=""
                />,
            )

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()

            await user.click(checkbox)

            await waitFor(() => {
                const textarea = screen.getByRole('textbox')
                expect(textarea).toHaveValue('')
            })
        })

        it('should handle missing onChangeMetaDescription callback', async () => {
            const user = userEvent.setup()
            render(
                <SeoMetaDescription
                    defaultDescription={defaultProps.defaultDescription}
                    metaDescription={defaultProps.metaDescription}
                />,
            )

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()

            await user.clear(textarea)
            await user.type(textarea, 'New description')

            await expect(user.tab()).resolves.not.toThrow()
        })

        it('should preserve value when checking and unchecking multiple times', async () => {
            const user = userEvent.setup()
            render(<SeoMetaDescription {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            const textarea = screen.getByRole('textbox')
            expect(textarea).toHaveValue('Custom meta description for SEO')

            await user.click(checkbox)

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
            })

            await user.click(checkbox)

            await waitFor(() => {
                const textarea = screen.getByRole('textbox')
                expect(textarea).toHaveValue('Custom meta description for SEO')
            })
        })
    })
})
