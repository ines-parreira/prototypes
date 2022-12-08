import {createSelector} from 'reselect'
import {isNewPhoneNumber} from 'pages/phoneNumbers/utils'
import {OldPhoneNumber} from 'models/phoneNumber/types'

import {RootState} from 'state/types'

import {PhoneNumbersState} from './types'

export const getPhoneNumbers = (state: RootState): PhoneNumbersState =>
    state.entities?.phoneNumbers || {}

export const getOldPhoneNumbers = (
    state: RootState
): PhoneNumbersState<OldPhoneNumber> => {
    const allNumbers = getPhoneNumbers(state)
    return Object.entries(allNumbers).reduce((acc, [key, value]) => {
        if (isNewPhoneNumber(value)) {
            return acc
        }
        return {
            ...acc,
            [key]: value,
        }
    }, {})
}

export const getPhoneNumber = (id: number) =>
    createSelector(getPhoneNumbers, (phoneNumbers) => phoneNumbers[id])
