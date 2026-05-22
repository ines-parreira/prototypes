import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RcsTemplateReference } from './RcsTemplateReference'

describe('<RcsTemplateReference />', () => {
    it('renders the disclosure header collapsed by default', () => {
        render(<RcsTemplateReference />)

        const trigger = screen.getByRole('button', {
            name: /What you can send/,
        })
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('expands to show layout categories and the Notion link when clicked', async () => {
        const user = userEvent.setup()
        render(<RcsTemplateReference />)

        await user.click(
            screen.getByRole('button', { name: /What you can send/ }),
        )

        expect(screen.getByText(/Carousel/)).toBeInTheDocument()
        expect(screen.getByText(/Single product card/)).toBeInTheDocument()
        expect(screen.getByText(/Text or text \+ image/)).toBeInTheDocument()

        const link = screen.getByRole('link', {
            name: /RCS Template Resolution Contract/,
        })
        expect(link).toHaveAttribute(
            'href',
            'https://www.notion.so/gorgias/RCS-Template-Resolution-Contract-3601ae2178f58168830de4e7c2ad68c4',
        )
    })
})
