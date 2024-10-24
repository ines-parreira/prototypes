import {renderHook} from '@testing-library/react-hooks'

import {phoneNumbers} from 'fixtures/newPhoneNumber'
import * as phoneNumbersSelectors from 'state/entities/phoneNumbers/selectors'

import usePhoneNumbers from '../usePhoneNumbers'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

const getNewPhoneNumbersSpy = jest.spyOn(
    phoneNumbersSelectors,
    'getNewPhoneNumbers'
)

const phoneNumbersMock = phoneNumbers.reduce(
    (acc, phoneNumber) => ({
        ...acc,
        [phoneNumber.id]: phoneNumber,
    }),
    {}
)

describe('usePhoneNumbers', () => {
    beforeEach(() => {
        getNewPhoneNumbersSpy.mockReturnValue(phoneNumbersMock)
    })

    it('should return phoneNumbers and getPhoneNumberById', () => {
        const {result} = renderHook(() => usePhoneNumbers())

        expect(result.current.phoneNumbers).toEqual(phoneNumbersMock)
        expect(result.current.getPhoneNumberById(phoneNumbers[0].id)).toEqual(
            phoneNumbers[0]
        )
    })
})
