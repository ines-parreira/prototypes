import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import * as ToggleButton from '../ToggleButton'

const onChangeFn = jest.fn()

const baseProps = {
    type: ToggleButton.Type.Label,
    value: 1,
    onChange: onChangeFn,
}

describe('<ToggleButton />', () => {
    it('should fire onChange after click', () => {
        const {getByText} = render(
            <ToggleButton.Wrapper {...baseProps}>
                <ToggleButton.Option value={1}>Option 1</ToggleButton.Option>
                <ToggleButton.Option value={2}>Option 2</ToggleButton.Option>
            </ToggleButton.Wrapper>
        )

        fireEvent.click(getByText('Option 2'))

        expect(onChangeFn).toHaveBeenCalledWith(2)

        fireEvent.click(getByText('Option 1'))

        expect(onChangeFn).toHaveBeenCalledWith(1)
    })

    it('should check option', () => {
        const {getByText} = render(
            <ToggleButton.Wrapper {...baseProps} value={2}>
                <ToggleButton.Option value={1}>Option 1</ToggleButton.Option>
                <ToggleButton.Option value={2}>Option 2</ToggleButton.Option>
            </ToggleButton.Wrapper>
        )

        expect(getByText('Option 1')).toHaveAttribute('aria-checked', 'false')
        expect(getByText('Option 2')).toHaveAttribute('aria-checked', 'true')
    })
})
