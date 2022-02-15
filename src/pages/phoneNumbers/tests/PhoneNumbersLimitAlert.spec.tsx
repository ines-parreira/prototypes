import React from 'react'
import {render} from '@testing-library/react'

import PhoneNumbersLimitAlert from '../PhoneNumbersLimitAlert'

describe('<PhoneNumbersLimitAlert/>', () => {
    describe('render()', () => {
        it('should not be displayed if the limit is not reached', () => {
            const {container} = render(
                <PhoneNumbersLimitAlert
                    maxPhoneNumbers={10}
                    currentPhoneNumbers={1}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should warn when the limit is about to be reached', () => {
            const {container} = render(
                <PhoneNumbersLimitAlert
                    maxPhoneNumbers={5}
                    currentPhoneNumbers={4}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should notify that the limit has been reached', () => {
            const {container} = render(
                <PhoneNumbersLimitAlert
                    maxPhoneNumbers={5}
                    currentPhoneNumbers={5}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
