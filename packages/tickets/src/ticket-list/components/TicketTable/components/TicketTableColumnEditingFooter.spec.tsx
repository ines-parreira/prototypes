import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { render } from '../../../../tests/render.utils'
import { TicketTableColumnEditingFooter } from './TicketTableColumnEditingFooter'

describe('TicketTableColumnEditingFooter', () => {
    it('shows both actions for users who can save for everyone', async () => {
        const user = userEvent.setup()
        const onResetToDefault = vi.fn()
        const onSaveForEveryone = vi.fn().mockResolvedValue(undefined)
        const onClose = vi.fn()
        render(
            <TicketTableColumnEditingFooter
                visibleColumns={['ticket', 'subject']}
                canSaveForEveryone={true}
                isSavingForEveryone={false}
                onClose={onClose}
                onResetToDefault={onResetToDefault}
                onSaveForEveryone={onSaveForEveryone}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /save for everyone/i }),
        )
        await user.click(
            screen.getByRole('button', { name: /restore saved view/i }),
        )

        expect(onSaveForEveryone).toHaveBeenCalledWith(['ticket', 'subject'])
        expect(onClose).toHaveBeenCalledTimes(2)
        expect(onResetToDefault).toHaveBeenCalledTimes(1)
    })

    it('hides the save-for-everyone action for unauthorized users', () => {
        render(
            <TicketTableColumnEditingFooter
                visibleColumns={['ticket']}
                canSaveForEveryone={false}
                isSavingForEveryone={false}
                onClose={vi.fn()}
                onResetToDefault={vi.fn()}
                onSaveForEveryone={vi.fn()}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /save for everyone/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /restore saved view/i }),
        ).toBeInTheDocument()
    })
})
