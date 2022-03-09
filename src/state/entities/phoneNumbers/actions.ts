import {createAction} from '@reduxjs/toolkit'

import {PhoneNumber} from 'models/phoneNumber/types'

import {
    PHONE_NUMBER_CREATED,
    PHONE_NUMBER_DELETED,
    PHONE_NUMBER_FETCHED,
    PHONE_NUMBER_UPDATED,
    PHONE_NUMBERS_FETCHED,
} from './constants'

export const phoneNumberCreated =
    createAction<PhoneNumber>(PHONE_NUMBER_CREATED)

export const phoneNumberDeleted = createAction<number>(PHONE_NUMBER_DELETED)

export const phoneNumberFetched =
    createAction<PhoneNumber>(PHONE_NUMBER_FETCHED)

export const phoneNumberUpdated =
    createAction<PhoneNumber>(PHONE_NUMBER_UPDATED)

export const phoneNumbersFetched = createAction<PhoneNumber[]>(
    PHONE_NUMBERS_FETCHED
)
