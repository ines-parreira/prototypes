import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import PhoneIntegrationListItem from '../PhoneIntegrationListItem'
import {PhoneFunction} from '../../../../../../business/twilio'

describe('<PhoneIntegrationListItem/>', () => {
    let integration: Map<string, any>

    beforeEach(() => {
        integration = fromJS({
            id: 1,
            name: 'Fake phone integration',
            meta: {
                emoji: '🍏',
                twilio: {
                    incoming_phone_number: {
                        friendly_name: '(415) 111-2222',
                    },
                },
            },
        })
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <PhoneIntegrationListItem integration={integration} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with IVR badge', () => {
            integration = integration.setIn(
                ['meta', 'function'],
                PhoneFunction.IVR
            )

            const {container} = render(
                <PhoneIntegrationListItem integration={integration} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
