import {PayloadActionCreator} from '@reduxjs/toolkit'

import {
    NewPhoneNumber,
    OldPhoneNumber,
    PhoneNumber,
} from '../../../models/phoneNumber/types'

import {
    PHONE_NUMBER_CREATED,
    PHONE_NUMBER_FETCHED,
    PHONE_NUMBERS_FETCHED,
} from './constants'

export type PhoneNumbersState = {
    [key: number]: OldPhoneNumber
}

export type NewPhoneNumbersState = {
    [key: number]: NewPhoneNumber
}

export type PhoneNumbersAction =
    | PhoneNumberCreatedAction
    | PhoneNumberFetchedAction
    | PhoneNumbersFetchedAction
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
