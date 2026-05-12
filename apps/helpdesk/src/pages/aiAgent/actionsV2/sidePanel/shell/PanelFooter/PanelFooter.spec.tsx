import { render, userEvent } from '@repo/testing'

import { PanelFooter } from './PanelFooter'

describe('PanelFooter', () => {
    it('triggers onSubmit when the primary button is clicked', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        const { getByRole } = render(<PanelFooter onSubmit={onSubmit} />)
        await user.click(getByRole('button', { name: /save and enable/i }))
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('triggers onDismiss when the dismiss button is clicked', async () => {
        const user = userEvent.setup()
        const onDismiss = jest.fn()
        const { getByRole } = render(
            <PanelFooter onDismiss={onDismiss} onSubmit={() => {}} />,
        )
        await user.click(getByRole('button', { name: /dismiss/i }))
        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('honors a custom submit label', () => {
        const { getByRole } = render(
            <PanelFooter onSubmit={() => {}} submitLabel="Apply" />,
        )
        expect(getByRole('button', { name: /apply/i })).toBeInTheDocument()
    })
})
