import {render, fireEvent, screen} from '@testing-library/react'
import React from 'react'

import {actionFixture} from 'fixtures/infobarCustomActions'
import {HttpMethod} from 'models/api/types'

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
            />
        )
        expect(screen.queryByText('Body')).toBeInTheDocument()
    })

    it('should call onChange when changing action method', () => {
        render(<Action {...props} />)
        fireEvent.click(screen.getByRole('textbox', {name: /Method/}))
        fireEvent.click(screen.getByRole('menuitem', {name: HttpMethod.Post}))
        expect(props.onChange).toHaveBeenCalledWith('method', HttpMethod.Post)
    })

    it('should call onChange when changing action url', () => {
        render(<Action {...props} />)
        const newValue = 'newValue'
        fireEvent.change(screen.getByRole('textbox', {name: /URL/}), {
            target: {value: newValue},
        })
        expect(props.onChange).toHaveBeenCalledWith('url', newValue)
    })

    it('should call onChange when changing action headers', () => {
        render(<Action {...props} />)

        fireEvent.click(
            screen.getAllByRole('button', {
                name: /Add Header/,
            })[0]
        )
        expect(props.onChange).toHaveBeenCalled()
    })

    it('should call onChange when changing action parameters', () => {
        render(<Action {...props} />)

        fireEvent.click(
            screen.getAllByRole('button', {
                name: /Add Parameter/,
            })[0]
        )
        expect(props.onChange).toHaveBeenCalled()
    })
})
