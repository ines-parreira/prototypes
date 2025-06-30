import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { actionFixture } from 'fixtures/infobarCustomActions'
import { HttpMethod } from 'models/api/types'

import Action from '../Action'

describe('<Action/>', () => {
    const props = {
        onChange: jest.fn(),
        action: actionFixture(),
    }

    it('should render without a Body component', () => {
        render(<Action {...props} />)
        expect(screen.queryByText('Body')).not.toBeInTheDocument()
    })
    it('should render with a Body component', () => {
        const action = actionFixture()
        action.method = HttpMethod.Put
        render(
            <Action
                {...{
                    ...props,
                    action,
                }}
            />,
        )
        expect(screen.queryByText('Body')).toBeInTheDocument()
    })

    it('should call onChange when changing action method', async () => {
        const user = userEvent.setup()
        render(<Action {...props} />)
        await act(() =>
            user.click(screen.getByRole('textbox', { name: /Method/ })),
        )
        await act(() =>
            user.click(screen.getByRole('menuitem', { name: HttpMethod.Post })),
        )
        expect(props.onChange).toHaveBeenLastCalledWith(
            'method',
            HttpMethod.Post,
        )
    })

    it('should call onChange when changing action url', async () => {
        render(<Action {...props} />)
        const newValue = 'newValue'
        const url = screen.getByRole('textbox', { name: /URL/ })
        await act(() => fireEvent.change(url, { target: { value: newValue } }))
        expect(props.onChange).toHaveBeenLastCalledWith('url', newValue)
    })

    it('should call onChange when changing action headers', async () => {
        const user = userEvent.setup()
        render(<Action {...props} />)

        await act(() =>
            user.click(
                screen.getAllByRole('button', {
                    name: /Add Header/,
                })[0],
            ),
        )
        expect(props.onChange).toHaveBeenCalled()
    })

    it('should call onChange when changing action parameters', async () => {
        const user = userEvent.setup()
        render(<Action {...props} />)

        await act(() =>
            user.click(
                screen.getAllByRole('button', {
                    name: /Add Parameter/,
                })[0],
            ),
        )
        expect(props.onChange).toHaveBeenCalled()
    })
})
