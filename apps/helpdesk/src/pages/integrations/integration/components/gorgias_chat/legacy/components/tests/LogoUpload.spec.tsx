import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { LogoUpload } from '../LogoUpload'

const mockHandleButtonClick = jest.fn()
const mockHandleRemove = jest.fn()

jest.mock('pages/common/forms/FileField', () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react')
    return {
        __esModule: true,
        default: forwardRef(function MockFileField(
            props: { onChange: (url?: string) => void },
            ref: React.Ref<unknown>,
        ) {
            useImperativeHandle(ref, () => ({
                handleButtonClick: mockHandleButtonClick,
                handleRemove: () => {
                    mockHandleRemove()
                    props.onChange(undefined)
                },
            }))
            return null
        }),
    }
})

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: () =>
        fromJS({
            id: 123,
        }),
}))

describe('LogoUpload', () => {
    const mockOnChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when no URL is provided', () => {
        it('should render the Add logo button', () => {
            render(<LogoUpload onChange={mockOnChange} />)

            expect(
                screen.getByRole('button', { name: /add logo/i }),
            ).toBeInTheDocument()
        })

        it('should not render the preview', () => {
            render(<LogoUpload onChange={mockOnChange} />)

            expect(screen.queryByAltText('Logo')).not.toBeInTheDocument()
        })

        it('should trigger file upload when Add logo button is clicked', async () => {
            const user = userEvent.setup()

            render(<LogoUpload onChange={mockOnChange} />)

            await act(() =>
                user.click(screen.getByRole('button', { name: /add logo/i })),
            )

            expect(mockHandleButtonClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('when URL is provided', () => {
        const testUrl = 'https://example.com/logo.png'

        it('should render the logo preview', () => {
            render(<LogoUpload url={testUrl} onChange={mockOnChange} />)

            const image = screen.getByAltText('Logo')
            expect(image).toBeInTheDocument()
            expect(image).toHaveAttribute('src', testUrl)
        })

        it('should render the remove button', () => {
            render(<LogoUpload url={testUrl} onChange={mockOnChange} />)

            expect(
                screen.getByRole('button', { name: /remove logo/i }),
            ).toBeInTheDocument()
        })

        it('should not render the Add logo button', () => {
            render(<LogoUpload url={testUrl} onChange={mockOnChange} />)

            expect(
                screen.queryByRole('button', { name: /add logo/i }),
            ).not.toBeInTheDocument()
        })

        it('should call onChange with undefined when remove button is clicked', async () => {
            const user = userEvent.setup()

            render(<LogoUpload url={testUrl} onChange={mockOnChange} />)

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /remove logo/i }),
                ),
            )

            expect(mockHandleRemove).toHaveBeenCalledTimes(1)
            expect(mockOnChange).toHaveBeenCalledWith(undefined)
        })
    })
})
