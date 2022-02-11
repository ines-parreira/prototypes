import {PayloadActionCreator} from '@reduxjs/toolkit'

import {LocaleCode} from 'models/helpCenter/types'

export enum UiActions {
    ChangeLanguage = 'UI/HELPCENTER/CHANGE_LANGUAGE',
    ChangeHelpCenterId = 'UI/HELPCENTER/CHANGE_ID',
}

export type ChangeViewLanguage = PayloadActionCreator<
    LocaleCode,
    UiActions.ChangeLanguage
>

export type ChangeHelpCenterId = PayloadActionCreator<
    number | null,
    UiActions.ChangeHelpCenterId
>

export type HelpCenterState = {
    currentLanguage: LocaleCode | null
    currentId: number | null
}
