import {PayloadActionCreator} from '@reduxjs/toolkit'

import {LocaleCode} from '../../../models/helpCenter/types'

export enum UiActions {
    ChangeLanguage = 'HELPCENTER/UI/CHANGE_LANGUAGE',
    ChangeHelpCenterId = 'HELPCENTER/UI/CHANGE_ID',
}

export type ChangeViewLanguage = PayloadActionCreator<
    LocaleCode,
    UiActions.ChangeLanguage
>

export type ChangeHelpCenterId = PayloadActionCreator<
    number | null,
    UiActions.ChangeHelpCenterId
>

export type HelpCenterUiState = {
    currentLanguage: LocaleCode | null
    currentId: number | null
}
