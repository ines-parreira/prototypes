import {createSelector} from 'reselect'

import {RootState} from 'state/types'

import {NewPhoneNumbersState, PhoneNumbersState} from './types'

export const getPhoneNumbers = (state: RootState): PhoneNumbersState =>
    state.entities?.phoneNumbers || {}

export const getNewPhoneNumbers = (state: RootState): NewPhoneNumbersState =>
    state.entities?.newPhoneNumbers || {}

export const getPhoneNumber = (id: number) =>
    createSelector(getPhoneNumbers, (phoneNumbers) => phoneNumbers[id])
