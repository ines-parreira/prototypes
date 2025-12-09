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
})
