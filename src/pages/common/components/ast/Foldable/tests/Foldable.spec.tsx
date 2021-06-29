import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import Foldable from '../Foldable'

describe('Foldable component', () => {
    it('should render open', () => {
        const {container} = render(
            <Foldable label={<div>my label</div>}>
                <div>my children</div>
            </Foldable>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render closed on toggle', () => {
        const {container, getByText} = render(
            <Foldable label={<div>my label</div>}>
                <div>my children</div>
            </Foldable>
        )

        fireEvent.click(getByText('keyboard_arrow_down'))
        expect(container.firstChild).toMatchSnapshot()
    })
})
