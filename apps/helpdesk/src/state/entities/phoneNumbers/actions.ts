import { createAction } from '@reduxjs/toolkit'

import type { NewPhoneNumber, OldPhoneNumber } from 'models/phoneNumber/types'

import {
    NEW_PHONE_NUMBER_CREATED,
    NEW_PHONE_NUMBER_DELETED,
    NEW_PHONE_NUMBER_FETCHED,
    NEW_PHONE_NUMBER_UPDATED,
    NEW_PHONE_NUMBERS_FETCHED,
    PHONE_NUMBER_CREATED,
    PHONE_NUMBER_DELETED,
    PHONE_NUMBER_FETCHED,
    PHONE_NUMBER_UPDATED,
    PHONE_NUMBERS_FETCHED,
} from './constants'

export const phoneNumberCreated =
    createAction<OldPhoneNumber>(PHONE_NUMBER_CREATED)

export const phoneNumberDeleted = createAction<number>(PHONE_NUMBER_DELETED)

export const phoneNumberFetched =
    createAction<OldPhoneNumber>(PHONE_NUMBER_FETCHED)

export const phoneNumberUpdated =
    createAction<OldPhoneNumber>(PHONE_NUMBER_UPDATED)

export const phoneNumbersFetched = createAction<OldPhoneNumber[]>(
    PHONE_NUMBERS_FETCHED,
)

export const newPhoneNumberCreated = createAction<NewPhoneNumber>(
    NEW_PHONE_NUMBER_CREATED,
)
export const newPhoneNumbersFetched = createAction<NewPhoneNumber[]>(
    NEW_PHONE_NUMBERS_FETCHED,
)
export const newPhoneNumberFetched = createAction<NewPhoneNumber>(
    NEW_PHONE_NUMBER_FETCHED,
)
export const newPhoneNumberUpdated = createAction<NewPhoneNumber>(
    NEW_PHONE_NUMBER_UPDATED,
)
export const newPhoneNumberDeleted = createAction<number>(
    NEW_PHONE_NUMBER_DELETED,
)
