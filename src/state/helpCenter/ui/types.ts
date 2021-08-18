import {PayloadActionCreator} from '@reduxjs/toolkit'

import {LocaleCode} from '../../../models/helpCenter/types'

export enum UiActions {
    ChangeLanguage = 'HELPCENTER/UI/CHANGE_LANGUAGE',
}

export type ChangeViewLanguage = PayloadActionCreator<
    LocaleCode,
    UiActions.ChangeLanguage
>

export type HelpCenterUiState = {
    currentLanguage: LocaleCode
}
