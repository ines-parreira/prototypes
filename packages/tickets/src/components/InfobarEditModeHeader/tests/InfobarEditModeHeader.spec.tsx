import { EditFieldsType } from '@repo/navigation'
import { screen } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { InfobarEditModeHeader } from '../InfobarEditModeHeader'

describe('InfobarEditModeHeader', () => {
    it('renders the title returned by getInfobarEditModeHeaderTitle', () => {
        render(
            <InfobarEditModeHeader
                editingWidgetType={EditFieldsType.Yotpo}
                onClose={vi.fn()}
            />,
        )

        expect(screen.getByText('Editing Yotpo widget')).toBeInTheDocument()
    })

    it('calls onClose when the exit button is clicked', async () => {
        const onClose = vi.fn()
        const { user } = render(
            <InfobarEditModeHeader
                editingWidgetType={EditFieldsType.Recharge}
                onClose={onClose}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /exit edit mode/i }),
        )

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
