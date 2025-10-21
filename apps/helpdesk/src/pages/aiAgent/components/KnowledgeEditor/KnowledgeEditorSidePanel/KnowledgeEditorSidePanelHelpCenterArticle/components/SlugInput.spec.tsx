import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SlugInput } from './SlugInput'

describe('SlugInput', () => {
    const defaultProps = {
        slug: 'returns',
        onChangeSlug: jest.fn(),
        articleId: 12345,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Initial rendering', () => {
        it('should render label with info icon', () => {
            render(<SlugInput {...defaultProps} />)

            expect(screen.getByText('Slug')).toBeInTheDocument()
        })

        it('should render input with initial slug value', () => {
            render(<SlugInput {...defaultProps} />)

            const input = screen.getByRole('textbox')

            expect(input).toHaveValue('returns')
        })

        it('should render article ID suffix', () => {
            render(<SlugInput {...defaultProps} />)

            expect(screen.getByText('-12345')).toBeInTheDocument()
        })

        it('should render caption text', () => {
            render(<SlugInput {...defaultProps} />)

            expect(
                screen.getByText(
                    /this is the article’s url ending\. example: \/returns\. use lowercase letters, numbers, and hyphens only\./i,
                ),
            ).toBeInTheDocument()
        })

        it('should not render error message initially', () => {
            render(<SlugInput {...defaultProps} />)

            expect(
                screen.queryByText(/this field is required/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('Input field editing', () => {
        it('should allow typing in the input field', async () => {
            const user = userEvent.setup()
            render(<SlugInput {...defaultProps} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.type(input, 'new-slug')

            expect(input).toHaveValue('new-slug')
        })

        it('should not call onChangeSlug during typing', async () => {
            const user = userEvent.setup()
            const onChangeSlug = jest.fn()
            render(<SlugInput {...defaultProps} onChangeSlug={onChangeSlug} />)

            const input = screen.getByRole('textbox')

            await user.type(input, '-updated')

            expect(onChangeSlug).not.toHaveBeenCalled()
        })

        it('should call onChangeSlug on blur with valid value', async () => {
            const user = userEvent.setup()
            const onChangeSlug = jest.fn()
            render(<SlugInput {...defaultProps} onChangeSlug={onChangeSlug} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.type(input, 'updated-slug')
            await user.tab()

            expect(onChangeSlug).toHaveBeenCalledWith('updated-slug')
        })

        it('should call onChangeSlug once per blur event', async () => {
            const user = userEvent.setup()
            const onChangeSlug = jest.fn()
            render(<SlugInput {...defaultProps} onChangeSlug={onChangeSlug} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.type(input, 'new-slug')
            await user.tab()

            expect(onChangeSlug).toHaveBeenCalledTimes(1)
        })
    })

    describe('Validation and error handling', () => {
        it('should show error when input is empty and blurred', async () => {
            const user = userEvent.setup()
            render(<SlugInput {...defaultProps} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })
        })

        it('should show error when input contains only whitespace and blurred', async () => {
            const user = userEvent.setup()
            render(<SlugInput {...defaultProps} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.type(input, '   ')
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })
        })

        it('should not call onChangeSlug when validation fails', async () => {
            const user = userEvent.setup()
            const onChangeSlug = jest.fn()
            render(<SlugInput {...defaultProps} onChangeSlug={onChangeSlug} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })

            expect(onChangeSlug).not.toHaveBeenCalled()
        })

        it('should clear error when user types valid content', async () => {
            const user = userEvent.setup()
            render(<SlugInput {...defaultProps} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })

            await user.type(input, 'valid-slug')

            await waitFor(() => {
                expect(
                    screen.queryByText(/this field is required/i),
                ).not.toBeInTheDocument()
            })
        })

        it('should not clear error when user types only whitespace', async () => {
            const user = userEvent.setup()
            render(<SlugInput {...defaultProps} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })

            await user.type(input, '  ')

            expect(
                screen.getByText(/this field is required/i),
            ).toBeInTheDocument()
        })

        it('should allow validation to pass after fixing error', async () => {
            const user = userEvent.setup()
            const onChangeSlug = jest.fn()
            render(<SlugInput {...defaultProps} onChangeSlug={onChangeSlug} />)

            const input = screen.getByRole('textbox')

            await user.clear(input)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i),
                ).toBeInTheDocument()
            })

            await user.type(input, 'fixed-slug')
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.queryByText(/this field is required/i),
                ).not.toBeInTheDocument()
            })

            expect(onChangeSlug).toHaveBeenCalledWith('fixed-slug')
        })
    })
})
