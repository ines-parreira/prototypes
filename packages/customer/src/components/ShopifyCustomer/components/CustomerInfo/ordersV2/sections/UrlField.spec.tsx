import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { UrlField } from './UrlField'

vi.mock('@repo/hooks', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

const url = 'https://shop.example.com/orders/12345'

describe('UrlField', () => {
    it('renders the URL as a link with correct href', () => {
        render(<UrlField url={url} />)

        const link = screen.getByRole('link', { name: url })
        expect(link).toHaveAttribute('href', url)
    })

    it('opens in a new tab with secure rel attribute', () => {
        render(<UrlField url={url} />)

        const link = screen.getByRole('link', { name: url })
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer')
    })

    it('renders a copy button', () => {
        render(<UrlField url={url} />)

        expect(
            screen.getByRole('button', { name: /copy url/i }),
        ).toBeInTheDocument()
    })

    it('copies the URL to clipboard when copy button is clicked', async () => {
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const { user } = render(<UrlField url={url} />)

        await user.click(screen.getByRole('button', { name: /copy url/i }))

        expect(writeTextSpy).toHaveBeenCalledWith(url)
    })
})
