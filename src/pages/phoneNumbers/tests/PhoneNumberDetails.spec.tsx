import React from 'react'
import {render} from '@testing-library/react'

import {phoneNumbers} from 'fixtures/phoneNumber'

import PhoneNumberDetails from '../PhoneNumberDetails'

describe('<PhoneNumberDetails/>', () => {
    describe('render()', () => {
        it('should render with a local US number', () => {
            const {container} = render(
                <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a toll-free CA number', () => {
            const {container} = render(
                <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a mobile GB number', () => {
            const {container} = render(
                <PhoneNumberDetails phoneNumber={phoneNumbers[2]} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
