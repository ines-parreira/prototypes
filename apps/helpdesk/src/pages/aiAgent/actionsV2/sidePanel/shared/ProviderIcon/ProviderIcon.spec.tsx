import { render } from '@repo/testing'

import { ProviderIcon } from './ProviderIcon'

describe('ProviderIcon', () => {
    it('renders with alt text when provided', () => {
        const { getByAltText } = render(
            <ProviderIcon iconUrl="/img/shopify.svg" alt="Shopify" />,
        )
        expect(getByAltText('Shopify')).toBeInTheDocument()
    })

    it('marks the image as decorative when alt is omitted', () => {
        const { container } = render(
            <ProviderIcon iconUrl="/img/shopify.svg" />,
        )
        const img = container.querySelector('img')
        expect(img).toHaveAttribute('aria-hidden', 'true')
        expect(img).toHaveAttribute('role', 'presentation')
        expect(img).toHaveAttribute('alt', '')
    })

    it('applies the small size class', () => {
        const { container } = render(
            <ProviderIcon iconUrl="/img/shopify.svg" size="sm" />,
        )
        const wrapper = container.firstChild as HTMLElement
        expect(wrapper.className).toMatch(/sm/)
    })
})
