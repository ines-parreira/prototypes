import { render, userEvent } from '@repo/testing'

import { PanelHeader } from './PanelHeader'

describe('PanelHeader', () => {
    it('renders title and description', () => {
        const { getByText } = render(
            <PanelHeader
                title="Actions library"
                description="Browse actions"
            />,
        )
        expect(getByText('Actions library')).toBeInTheDocument()
        expect(getByText('Browse actions')).toBeInTheDocument()
    })

    it('renders the back link when provided', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        const { getByRole } = render(
            <PanelHeader
                title="Shopify"
                backLink={{ label: 'Back to apps', onClick }}
            />,
        )
        await user.click(getByRole('button', { name: /back to apps/i }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
