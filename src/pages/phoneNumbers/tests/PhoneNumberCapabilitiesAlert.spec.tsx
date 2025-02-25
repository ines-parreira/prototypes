import React from 'react'

import { render } from '@testing-library/react'

import * as capabilitiesHook from 'hooks/integrations/phone/usePhoneNumberCapabilities'
import { PhoneCountry, PhoneType } from 'models/phoneNumber/types'

import PhoneNumberCapabilitiesAlert from '../PhoneNumberCapabilitiesAlert'

describe('<PhoneNumberCapabilitiesAlert/>', () => {
    describe('render()', () => {
        it('should not be displayed if there are no limits', () => {
            jest.spyOn(
                capabilitiesHook,
                'usePhoneNumberCapabilities',
            ).mockReturnValue({
                sms: true,
                mms: true,
                voice: true,
                whatsapp: true,
            })
            const { container } = render(
                <PhoneNumberCapabilitiesAlert
                    country={PhoneCountry.US}
                    type={PhoneType.Local}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not display a banner with missing capabilities', () => {
            jest.spyOn(
                capabilitiesHook,
                'usePhoneNumberCapabilities',
            ).mockReturnValue({
                sms: false,
                mms: false,
                voice: true,
                whatsapp: true,
            })
            const { container } = render(
                <PhoneNumberCapabilitiesAlert
                    country={PhoneCountry.US}
                    type={PhoneType.Local}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
