import {createAction} from '@reduxjs/toolkit'

import {NewPhoneNumber, OldPhoneNumber} from 'models/phoneNumber/types'

import {
    PHONE_NUMBER_CREATED,
    PHONE_NUMBER_DELETED,
    PHONE_NUMBER_FETCHED,
    PHONE_NUMBER_UPDATED,
    PHONE_NUMBERS_FETCHED,
    MEW_PHONE_NUMBERS_FETCHED,
} from './constants'

export const phoneNumberCreated =
    createAction<OldPhoneNumber>(PHONE_NUMBER_CREATED)

export const phoneNumberDeleted = createAction<number>(PHONE_NUMBER_DELETED)

export const phoneNumberFetched =
    createAction<OldPhoneNumber>(PHONE_NUMBER_FETCHED)

export const phoneNumberUpdated =
    createAction<OldPhoneNumber>(PHONE_NUMBER_UPDATED)

export const phoneNumbersFetched = createAction<OldPhoneNumber[]>(
    PHONE_NUMBERS_FETCHED
)
export const newPhoneNumbersFetched = createAction<NewPhoneNumber[]>(
    MEW_PHONE_NUMBERS_FETCHED
)
