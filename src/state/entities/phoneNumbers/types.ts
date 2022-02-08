import {PayloadActionCreator} from '@reduxjs/toolkit'

import {PhoneNumber} from '../../../models/phoneNumber/types'

import {
    PHONE_NUMBER_CREATED,
    PHONE_NUMBER_FETCHED,
    PHONE_NUMBERS_FETCHED,
} from './constants'

export type PhoneNumbersState = {
    [key: number]: PhoneNumber
}

export type PhoneNumbersAction =
    | PhoneNumberCreatedAction
    | PhoneNumberFetchedAction
    | PhoneNumbersFetchedAction

export type PhoneNumberCreatedAction = PayloadActionCreator<
    PhoneNumber,
    typeof PHONE_NUMBER_CREATED
>

export type PhoneNumberFetchedAction = PayloadActionCreator<
    PhoneNumber,
    typeof PHONE_NUMBER_FETCHED
>

export type PhoneNumbersFetchedAction = PayloadActionCreator<
    PhoneNumber[],
    typeof PHONE_NUMBERS_FETCHED
>
