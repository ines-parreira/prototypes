import { act, screen, waitFor } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { EditableBreadcrumb } from '../EditableBreadcrumb'

describe('EditableBreadcrumb', () => {
    it('should render the breadcrumb with the correct value', () => {
        render(<EditableBreadcrumb value="Test Ticket" />)
        expect(screen.getByText('Test Ticket')).toBeInTheDocument()
    })

    it('should call the onChange function when the value is changed', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <EditableBreadcrumb value="Test Ticket" onChange={onChange} />,
        )

        await act(async () => {
            await user.click(screen.getByText('Test Ticket'))
            await user.type(screen.getByText('Test Ticket'), ' updated')
            await user.tab()
        })

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith('Test Ticket updated')
        })
    })

    it('should focus the input when the edit pencil is clicked', async () => {
        const { user } = render(<EditableBreadcrumb value="Test Ticket" />)

        await act(async () => {
            await user.click(screen.getByText('Test Ticket'))
        })

        expect(screen.getByText('Test Ticket')).toHaveFocus()
    })

    it('should focus the breadcrumb by default when autoFocus is enabled', () => {
        render(<EditableBreadcrumb value="Test Ticket" autoFocus />)

        expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('should not show tooltip when text is not truncated', async () => {
        const { user } = render(<EditableBreadcrumb value="Test Ticket" />)

        const container = screen.getByRole('textbox').parentElement!
        await user.hover(container)

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('should enable tooltip when text is truncated', async () => {
        const { user } = render(<EditableBreadcrumb value="Test Ticket" />)

        const textElement = screen.getByRole('textbox')
        Object.defineProperty(textElement, 'scrollWidth', { value: 200 })
        Object.defineProperty(textElement, 'clientWidth', { value: 100 })

        const container = textElement.parentElement!
        await user.hover(container)
        await user.unhover(container)
        await user.hover(container)

        await waitFor(() => {
            expect(screen.getByRole('tooltip')).toBeInTheDocument()
        })
    })

    it('should show an empty tooltip when value is null and text is truncated', async () => {
        const { user } = render(<EditableBreadcrumb value={null} />)

        const textElement = screen.getByRole('textbox')
        Object.defineProperty(textElement, 'scrollWidth', { value: 200 })
        Object.defineProperty(textElement, 'clientWidth', { value: 100 })

        const container = textElement.parentElement!
        await user.hover(container)
        await user.unhover(container)
        await user.hover(container)

        await waitFor(() => {
            expect(screen.getByRole('tooltip')).toBeInTheDocument()
        })
    })
})
