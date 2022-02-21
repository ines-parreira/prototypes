import {createSelector} from 'reselect'

import {RootState} from 'state/types'

import {PhoneNumbersState} from './types'

export const getPhoneNumbers = (state: RootState): PhoneNumbersState =>
    state.entities?.phoneNumbers || {}

export const getPhoneNumber = (id: number) =>
    createSelector(getPhoneNumbers, (phoneNumbers) => phoneNumbers[id])
