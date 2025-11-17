import { createAction } from '@reduxjs/toolkit'

import type { LocaleCode } from 'models/helpCenter/types'

import { UiActions } from './types'

export const changeViewLanguage = createAction<LocaleCode>(
    UiActions.ChangeLanguage,
)

export const changeHelpCenterId = createAction<number | null>(
    UiActions.ChangeHelpCenterId,
)
