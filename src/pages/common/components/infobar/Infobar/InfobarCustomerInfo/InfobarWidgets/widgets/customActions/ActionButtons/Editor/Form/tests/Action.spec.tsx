import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {HttpMethod} from '../../../../../../../../../../../../../models/api/types'
import Action from '../Action'

describe('<Action/>', () => {
    const props = {
        onChange: jest.fn(),
        action: {
            method: HttpMethod.Get,
            url: '',
            headers: [],
            params: [],
            body: {},
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render without a Body component', () => {
        const {container} = render(<Action {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render with a Body component', () => {
        const {container} = render(
            <Action
                {...{
                    ...props,
                    action: {
                        method: HttpMethod.Put,
                        url: '',
                        headers: [],
                        params: [],
                        body: {},
                    },
                }}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onChange when changing action method', () => {
        render(<Action {...props} />)
        fireEvent.change(screen.getByRole('combobox', {name: 'Method'}), {
            target: {value: HttpMethod.Post},
        })
        expect(props.onChange).toHaveBeenCalledWith('method', HttpMethod.Post)
    })

    it('should call onChange when changing action url', () => {
        render(<Action {...props} />)
        const newValue = 'newValue'
        fireEvent.change(screen.getByRole('textbox', {name: 'URL'}), {
            target: {value: newValue},
        })
        expect(props.onChange).toHaveBeenCalledWith('url', newValue)
    })

    it('should call onChange when changing action headers', () => {
        render(<Action {...props} />)

        fireEvent.click(
            screen.getAllByRole('button', {
                name: 'add',
            })[0]
        )
        expect(props.onChange).toHaveBeenCalled()
    })

    it('should call onChange when changing action parameters', () => {
        render(<Action {...props} />)

        fireEvent.click(
            screen.getAllByRole('button', {
                name: 'add',
            })[0]
        )
        expect(props.onChange).toHaveBeenCalled()
    })
})
