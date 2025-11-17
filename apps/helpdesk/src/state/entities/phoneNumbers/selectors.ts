import { createSelector } from 'reselect'

import type { RootState } from 'state/types'

import type { NewPhoneNumbersState, PhoneNumbersState } from './types'

export const getPhoneNumbers = (state: RootState): PhoneNumbersState =>
    state.entities?.phoneNumbers || {}

export const getNewPhoneNumbers = (state: RootState): NewPhoneNumbersState =>
    state.entities?.newPhoneNumbers || {}

export const getPhoneNumber = (id: number) =>
    createSelector(getNewPhoneNumbers, (phoneNumbers) => phoneNumbers[id])

export const getNewPhoneNumber = (id: number) =>
    createSelector(getNewPhoneNumbers, (phoneNumbers) => phoneNumbers[id])

export const getNewPhoneNumberByNumber = (number: string) =>
    createSelector(getNewPhoneNumbers, (phoneNumbers) =>
        Object.values(phoneNumbers).find(
            (phoneNumber) => phoneNumber.phone_number === number,
        ),
    )
