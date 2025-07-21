import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import useCopyToClipboard from 'hooks/useCopyToClipboard'

import { CopyableTextField } from '../CopyableTextField'

jest.mock('hooks/useCopyToClipboard', () => jest.fn())
const copyToClipboard = jest.fn()
const useCopyToClipboardMock = useCopyToClipboard as jest.Mock

describe('CopyableTextField', () => {
    beforeEach(() => {
        useCopyToClipboardMock.mockReturnValue([
            { value: undefined, error: undefined },
            copyToClipboard,
        ])
    })

    it('should render the field and the copy button', () => {
        render(<CopyableTextField value="test" />)
        expect(screen.getByDisplayValue('test')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })

    it('should copy the value when the button is clicked', async () => {
        useCopyToClipboardMock.mockReturnValue([
            { value: 'test', error: undefined },
            copyToClipboard,
        ])

        render(<CopyableTextField value="test" />)
        const button = screen.getByRole('button')
        act(() => {
            fireEvent.click(button)
        })

        await waitFor(() => {
            expect(screen.getByText('Copied!')).toBeInTheDocument()
            expect(copyToClipboard).toHaveBeenCalledWith('test')
        })
    })

    it('should change the button text to "Copied!" when the button is clicked and back to "Copy" after 2 seconds', async () => {
        useCopyToClipboardMock.mockReturnValue([
            { value: 'test', error: undefined },
            copyToClipboard,
        ])
        jest.useFakeTimers()

        render(<CopyableTextField value="test" />)

        const button = screen.getByRole('button')
        act(() => {
            fireEvent.click(button)
        })

        await waitFor(() => {
            expect(screen.queryByText('Copied!')).toBeInTheDocument()
            expect(screen.queryByText('Copy')).not.toBeInTheDocument()
        })

        act(() => {
            jest.advanceTimersByTime(2000)
        })

        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
        expect(screen.queryByText('Copy')).toBeInTheDocument()
    })

    it('should not copy the value when the button is clicked if the value is empty', async () => {
        const onCopy = jest.fn()

        render(<CopyableTextField value={undefined} onCopy={onCopy} />)

        const button = screen.getByRole('button')
        expect(button).toBeAriaDisabled()

        act(() => {
            fireEvent.click(button)
        })

        expect(onCopy).not.toHaveBeenCalled()
    })

    it('should not show the "Copied!" text if there was an error', async () => {
        useCopyToClipboardMock.mockReturnValue([
            { value: undefined, error: new Error('Failed to copy') },
            copyToClipboard,
        ])

        const onCopy = jest.fn()

        render(<CopyableTextField value={undefined} onCopy={onCopy} />)

        const button = screen.getByRole('button')
        expect(button).toBeAriaDisabled()

        act(() => {
            fireEvent.click(button)
        })

        expect(onCopy).not.toHaveBeenCalled()
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })

    it('should reset copied state when the value changes', async () => {
        useCopyToClipboardMock.mockReturnValue([
            { value: 'test', error: undefined },
            copyToClipboard,
        ])

        const { rerender } = render(<CopyableTextField value="test" />)

        const button = screen.getByRole('button')
        act(() => {
            fireEvent.click(button)
        })

        await waitFor(() => {
            expect(screen.queryByText('Copied!')).toBeInTheDocument()
            expect(screen.queryByText('Copy')).not.toBeInTheDocument()
        })

        rerender(<CopyableTextField value="test-2" />)

        await waitFor(() => {
            expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
            expect(screen.queryByText('Copy')).toBeInTheDocument()
        })
    })
})
