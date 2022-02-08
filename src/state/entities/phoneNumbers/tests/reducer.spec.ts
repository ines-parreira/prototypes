import {phoneNumbers as phoneNumbersFixtures} from 'fixtures/phoneNumber'

import {
    phoneNumberCreated,
    phoneNumberDeleted,
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

    describe('deletePhoneNumner action', () => {
        it('should delete a phone numner from the state', () => {
            const newState = reducer(
                {'1': phoneNumbersFixtures[0]},
                phoneNumberDeleted(1)
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
