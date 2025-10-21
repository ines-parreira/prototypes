import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExcerptInput } from './ExcerptInput'

describe('ExcerptInput', () => {
    const defaultProps = {
        excerpt: 'This is a short summary of the article',
        onChangeExcerpt: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Initial rendering', () => {
        it('should render label', () => {
            render(<ExcerptInput {...defaultProps} />)

            expect(screen.getByText('Description')).toBeInTheDocument()
        })

        it('should render textarea with initial excerpt value', () => {
            render(<ExcerptInput {...defaultProps} />)

            const textarea = screen.getByRole('textbox')

            expect(textarea).toHaveValue(
                'This is a short summary of the article',
            )
        })

        it('should render caption text', () => {
            render(<ExcerptInput {...defaultProps} />)

            expect(
                screen.getByText(
                    /short summary displayed below article title/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render enabled textarea when onChangeExcerpt is provided', () => {
            render(<ExcerptInput {...defaultProps} />)

            const textarea = screen.getByRole('textbox')

            expect(textarea).not.toBeDisabled()
        })

        it('should render disabled textarea when onChangeExcerpt is not provided', () => {
            render(<ExcerptInput excerpt={defaultProps.excerpt} />)

            const textarea = screen.getByRole('textbox')

            expect(textarea).toBeDisabled()
        })

        it('should render textarea with correct rows attribute', () => {
            render(<ExcerptInput {...defaultProps} />)

            const textarea = screen.getByRole('textbox')

            expect(textarea).toHaveAttribute('rows', '4')
        })

        it('should render textarea with correct name attribute', () => {
            render(<ExcerptInput {...defaultProps} />)

            const textarea = screen.getByRole('textbox')

            expect(textarea).toHaveAttribute('name', 'excerpt')
        })

        it('should render textarea with maxLength attribute', () => {
            render(<ExcerptInput {...defaultProps} />)

            const textarea = screen.getByRole('textbox')

            expect(textarea).toHaveAttribute('maxlength', '250')
        })
    })

    describe('Textarea editing', () => {
        it('should allow typing in the textarea', async () => {
            const user = userEvent.setup()
            render(<ExcerptInput {...defaultProps} />)

            const textarea = screen.getByRole('textbox')

            await user.clear(textarea)
            await user.type(textarea, 'New excerpt content')

            expect(textarea).toHaveValue('New excerpt content')
        })

        it('should not call onChangeExcerpt during typing', async () => {
            const user = userEvent.setup()
            const onChangeExcerpt = jest.fn()
            render(
                <ExcerptInput
                    {...defaultProps}
                    onChangeExcerpt={onChangeExcerpt}
                />,
            )

            const textarea = screen.getByRole('textbox')

            await user.type(textarea, ' Additional text')

            expect(onChangeExcerpt).not.toHaveBeenCalled()
        })

        it('should call onChangeExcerpt on blur with updated value', async () => {
            const user = userEvent.setup()
            const onChangeExcerpt = jest.fn()
            render(
                <ExcerptInput
                    {...defaultProps}
                    onChangeExcerpt={onChangeExcerpt}
                />,
            )

            const textarea = screen.getByRole('textbox')

            await user.clear(textarea)
            await user.type(textarea, 'Updated excerpt')
            await user.tab()

            expect(onChangeExcerpt).toHaveBeenCalledWith('Updated excerpt')
        })

        it('should call onChangeExcerpt once per blur event', async () => {
            const user = userEvent.setup()
            const onChangeExcerpt = jest.fn()
            render(
                <ExcerptInput
                    {...defaultProps}
                    onChangeExcerpt={onChangeExcerpt}
                />,
            )

            const textarea = screen.getByRole('textbox')

            await user.clear(textarea)
            await user.type(textarea, 'New content')
            await user.tab()

            expect(onChangeExcerpt).toHaveBeenCalledTimes(1)
        })

        it('should not call onChangeExcerpt when disabled', async () => {
            const user = userEvent.setup()
            const onChangeExcerpt = jest.fn()
            render(<ExcerptInput excerpt={defaultProps.excerpt} />)

            await user.tab()

            expect(onChangeExcerpt).not.toHaveBeenCalled()
        })

        it('should allow multiple edits and blur events', async () => {
            const user = userEvent.setup()
            const onChangeExcerpt = jest.fn()
            render(
                <ExcerptInput
                    {...defaultProps}
                    onChangeExcerpt={onChangeExcerpt}
                />,
            )

            const textarea = screen.getByRole('textbox')

            await user.clear(textarea)
            await user.type(textarea, 'First edit')
            await user.tab()

            expect(onChangeExcerpt).toHaveBeenCalledWith('First edit')

            await user.clear(textarea)
            await user.type(textarea, 'Second edit')
            await user.tab()

            expect(onChangeExcerpt).toHaveBeenCalledWith('Second edit')
            expect(onChangeExcerpt).toHaveBeenCalledTimes(2)
        })
    })
})
