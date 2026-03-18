import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { render } from '../../../tests/render.utils'
import { CopyButton } from '../CopyButton'

describe('CopyButton', () => {
    it('renders copy icon initially', () => {
        render(<CopyButton text="hello" />)

        expect(screen.getByRole('img', { name: 'copy' })).toBeInTheDocument()
    })

    it('shows check icon after click', async () => {
        const { user } = render(<CopyButton text="hello" />)

        await user.click(screen.getByRole('button', { name: 'Copy message' }))

        expect(screen.getByRole('img', { name: 'check' })).toBeInTheDocument()
    })

    it('reverts to copy icon after 2 seconds', async () => {
        vi.useFakeTimers()
        const user = userEvent.setup({
            advanceTimers: vi.advanceTimersByTime.bind(vi),
        })
        render(<CopyButton text="hello" />)

        await user.click(screen.getByRole('button', { name: 'Copy message' }))
        expect(screen.getByRole('img', { name: 'check' })).toBeInTheDocument()

        act(() => {
            vi.advanceTimersByTime(2000)
        })

        expect(screen.getByRole('img', { name: 'copy' })).toBeInTheDocument()
        vi.useRealTimers()
    })
})
