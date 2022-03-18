import React from 'react'
import {render} from '@testing-library/react'

import ButtonIconLabel from '../ButtonIconLabel'

describe('<ButtonIconLabel />', () => {
    it('should render an icon label', () => {
        const {container} = render(
            <ButtonIconLabel icon="calendar_today">Click me!</ButtonIconLabel>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a right positioned icon when passing the right position', () => {
        const {container} = render(
            <ButtonIconLabel icon="calendar_today" position="right">
                Click me!
            </ButtonIconLabel>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
