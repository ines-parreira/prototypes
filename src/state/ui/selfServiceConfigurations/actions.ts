import {createAction} from '@reduxjs/toolkit'

import {SET_LOADING} from './constants'

export const setLoading = createAction<boolean>(SET_LOADING)
