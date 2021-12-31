import {phoneNumbers as phoneNumbersFixtures} from 'fixtures/phoneNumber'

import {
    phoneNumberCreated,
    phoneNumberFetched,
    phoneNumbersFetched,
} from '../actions'
import reducer from '../reducer'

describe('phoneNumbers reducer', () => {
    describe('createPhoneNumber action', () => {
        it('should add a new phone number to the state', () => {
            const newState = reducer(
                {},
                phoneNumberCreated(phoneNumbersFixtures[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchPhoneNumber action', () => {
        it('should add a new phone number to the state', () => {
            const newState = reducer(
                {},
                phoneNumberFetched(phoneNumbersFixtures[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchPhoneNumbers action', () => {
        it('should add the phone numbers to the state', () => {
            const newState = reducer(
                {},
                phoneNumbersFetched(phoneNumbersFixtures)
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
