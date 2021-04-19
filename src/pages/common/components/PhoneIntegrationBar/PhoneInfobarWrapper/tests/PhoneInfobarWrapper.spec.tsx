import React from 'react'
import {render} from '@testing-library/react'

import PhoneInfobarWrapper from '../PhoneInfobarWrapper'

describe('<PhoneInfobarWrapper/>', () => {
    it('should render', () => {
        const {container} = render(
            <PhoneInfobarWrapper>Foo...</PhoneInfobarWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render as primary', () => {
        const {container} = render(
            <PhoneInfobarWrapper primary>Foo...</PhoneInfobarWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with current infobar size', () => {
        window.localStorage.setItem('infobar-width', '500')

        const {container} = render(
            <PhoneInfobarWrapper>Foo...</PhoneInfobarWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
