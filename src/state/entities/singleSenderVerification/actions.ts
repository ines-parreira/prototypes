import {createAction} from '@reduxjs/toolkit'

import {SenderVerification} from 'models/singleSenderVerification/types'

import {REMOVE_VERIFICATION, SET_VERIFICATION} from './constants'

export const setVerification =
    createAction<SenderVerification>(SET_VERIFICATION)
export const removeVerification = createAction<number>(REMOVE_VERIFICATION)
