import { render, screen } from '@testing-library/react'

import CardHeaderIcon from '../CardHeaderIcon'

describe('CardHeaderIcon', () => {
    it('renders an img with the correct src and alt', () => {
        const src = 'test-image.png'
        const alt = 'Test Icon'
        render(<CardHeaderIcon src={src} alt={alt} />)

        const img = screen.getByRole('img', { name: alt })
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', src)
        expect(img).toHaveAttribute('alt', alt)
    })
    it('renders with empty alt if alt is an empty string', () => {
        const src = 'icon.svg'
        render(<CardHeaderIcon src={src} alt="" />)

        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('alt', '')
    })
})
