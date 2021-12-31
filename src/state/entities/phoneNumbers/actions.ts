import {createAction} from '@reduxjs/toolkit'

import {PhoneNumber} from 'models/phoneNumber/types'

import {
    PHONE_NUMBER_CREATED,
    PHONE_NUMBER_FETCHED,
    PHONE_NUMBERS_FETCHED,
} from './constants'

export const phoneNumberCreated =
    createAction<PhoneNumber>(PHONE_NUMBER_CREATED)

export const phoneNumberFetched =
    createAction<PhoneNumber>(PHONE_NUMBER_FETCHED)

export const phoneNumbersFetched = createAction<PhoneNumber[]>(
    PHONE_NUMBERS_FETCHED
)
