import {IntegrationType} from 'models/integration/types'
import {phoneNumbers} from 'fixtures/phoneNumber'

import {hasCapability} from '../utils'

describe('hasCapability()', () => {
    it("maps integration type to a given phone number's capabilities", () => {
        const numberWithBothCapabilities = phoneNumbers[0]
        const numberWithoutSmsCapability = phoneNumbers[2]
        expect(
            hasCapability(numberWithBothCapabilities, IntegrationType.Phone)
        ).toEqual(true)
        expect(
            hasCapability(numberWithBothCapabilities, IntegrationType.Sms)
        ).toEqual(true)
        expect(
            hasCapability(numberWithoutSmsCapability, IntegrationType.Phone)
        ).toEqual(true)
        expect(
            hasCapability(numberWithoutSmsCapability, IntegrationType.Sms)
        ).toEqual(false)
    })
})
