import {createAction} from '@reduxjs/toolkit'

import {UiActions} from './types'

export const changeContactFormId = createAction<number | null>(
    UiActions.ChangeContactFormId
)
