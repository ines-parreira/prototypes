import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import PhoneIntegrationPreferences from '../PhoneIntegrationPreferences'

describe('<PhoneIntegrationPreferences/>', () => {
    let updateOrCreateIntegration: jest.MockedFunction<any>
    let deleteIntegration: jest.MockedFunction<any>
    let integration: Map<string, any>

    beforeEach(() => {
        updateOrCreateIntegration = jest.fn()
        deleteIntegration = jest.fn()

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
                preferences: {
                    record_inbound_calls: false,
                    voicemail_outside_business_hours: true,
                    record_outbound_calls: false,
                },
            },
        })
    })

    // Bootstrap uses the current date to generate an ID for each button that is linked to a popover
    beforeEach(() => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1615240000000)
    })

    afterEach(() => {
        jest.clearAllMocks()
        ;((global.Date.now as unknown) as jest.SpyInstance).mockRestore()
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <PhoneIntegrationPreferences
                    integration={integration}
                    actions={{updateOrCreateIntegration, deleteIntegration}}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
