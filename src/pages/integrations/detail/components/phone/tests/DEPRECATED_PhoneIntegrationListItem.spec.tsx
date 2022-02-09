import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import DEPRECATED_PhoneIntegrationListItem from '../DEPRECATED_PhoneIntegrationListItem'
import {PhoneFunction} from '../../../../../../business/twilio'

describe('<DEPRECATED_PhoneIntegrationListItem/>', () => {
    let integration: Map<string, any>

    beforeEach(() => {
        integration = fromJS({
            id: 1,
            name: 'Fake phone integration',
            meta: {
                emoji: '🍏',
                twilio: {
                    incoming_phone_number: {
                        friendly_name: '+1 415-111-2222',
                    },
                },
            },
        })
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <DEPRECATED_PhoneIntegrationListItem
                    integration={integration}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with IVR badge', () => {
            integration = integration.setIn(
                ['meta', 'function'],
                PhoneFunction.Ivr
            )

            const {container} = render(
                <DEPRECATED_PhoneIntegrationListItem
                    integration={integration}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
