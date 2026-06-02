import { screen } from '@testing-library/react'

import { MenuItem } from '@gorgias/axiom'

import { render } from '../../../../../tests/render.utils'
import { EditableMenuField } from '../EditableMenuField'

type RenderFieldOptions = {
    isReadOnly?: boolean
    onDelete?: () => void
    onValueChange?: (value: string) => void
    onBlur?: (value: string) => void
    value?: string
}

function renderField({
    isReadOnly = false,
    onDelete = vi.fn(),
    onValueChange = vi.fn(),
    onBlur = vi.fn(),
    value = 'john@example.com',
}: RenderFieldOptions = {}) {
    return render(
        <EditableMenuField
            value={value}
            onValueChange={onValueChange}
            onBlur={onBlur}
            onDelete={onDelete}
            renderTrigger={(value) => <span>{value}</span>}
            name="email"
            isReadOnly={isReadOnly}
        >
            <MenuItem label="Send email" />
        </EditableMenuField>,
    )
}

describe('EditableMenuField', () => {
    it('should show edit and delete actions by default', async () => {
        const { user } = renderField()

        await user.click(
            screen.getByRole('button', { name: /john@example.com/i }),
        )

        expect(
            await screen.findByRole('menuitem', { name: 'Send email' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Edit email/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Delete email/ }),
        ).toBeInTheDocument()
    })

    it('should hide edit and delete actions when read-only', async () => {
        const { user } = renderField({ isReadOnly: true })

        await user.click(
            screen.getByRole('button', { name: /john@example.com/i }),
        )

        expect(
            await screen.findByRole('menuitem', { name: 'Send email' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /Edit email/ }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /Delete email/ }),
        ).not.toBeInTheDocument()
    })

    it('should render an empty read-only field without calling edit handlers', async () => {
        const onValueChange = vi.fn()
        const onBlur = vi.fn()
        const { user } = renderField({
            isReadOnly: true,
            onValueChange,
            onBlur,
            value: '',
        })

        const input = screen.getByRole('textbox', { name: '+ Add' })

        expect(input).toHaveAttribute('readonly')

        await user.click(input)
        await user.type(input, 'john@example.com')
        await user.tab()

        expect(onValueChange).not.toHaveBeenCalled()
        expect(onBlur).not.toHaveBeenCalled()
    })
})
