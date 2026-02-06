import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { CopyButton } from '../CopyButton'

const mockCopyToClipboard = vi.fn()
const { useCopyToClipboard } = vi.hoisted(() => ({
    useCopyToClipboard: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useCopyToClipboard,
}))

describe('CopyButton', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useCopyToClipboard.mockReturnValue([null, mockCopyToClipboard])
    })

    it('should render copy icon', () => {
        render(<CopyButton value="test value" isVisible={true} />)

        const copyIcon = screen.getByLabelText('copy')
        expect(copyIcon).toBeInTheDocument()
    })

    it('should copy value to clipboard when clicked', async () => {
        const { user } = render(
            <CopyButton value="test@example.com" isVisible={true} />,
        )

        const copyIcon = screen.getByLabelText('copy')

        await act(() => user.click(copyIcon))

        expect(mockCopyToClipboard).toHaveBeenCalledWith('test@example.com')
    })

    it('should show tooltip after copying', async () => {
        const { user } = render(
            <CopyButton value="test value" isVisible={true} />,
        )

        const copyIcon = screen.getByLabelText('copy')

        await act(() => user.click(copyIcon))

        expect(
            await screen.findByText('Copied to clipboard'),
        ).toBeInTheDocument()
    })

    it('should hide tooltip on mouse leave', async () => {
        const { user } = render(
            <CopyButton value="test value" isVisible={true} />,
        )

        const copyIcon = screen.getByLabelText('copy')

        await act(() => user.click(copyIcon))

        expect(
            await screen.findByText('Copied to clipboard'),
        ).toBeInTheDocument()

        await act(() => user.unhover(copyIcon))

        await waitFor(() => {
            expect(
                screen.queryByText('Copied to clipboard'),
            ).not.toBeInTheDocument()
        })
    })

    it('should hide tooltip after 2 seconds timeout', async () => {
        vi.useFakeTimers()

        render(<CopyButton value="test value" isVisible={true} />)

        const copyIcon = screen.getByLabelText('copy')

        act(() => {
            fireEvent.pointerDown(copyIcon)
        })

        await vi.waitFor(() => {
            expect(screen.getByText('Copied to clipboard')).toBeInTheDocument()
        })

        act(() => {
            vi.advanceTimersByTime(2000)
        })

        await vi.waitFor(() => {
            expect(
                screen.queryByText('Copied to clipboard'),
            ).not.toBeInTheDocument()
        })

        vi.useRealTimers()
    })
})
