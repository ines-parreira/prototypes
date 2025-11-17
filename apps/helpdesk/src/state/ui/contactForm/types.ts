import type { PayloadActionCreator } from '@reduxjs/toolkit'

export enum UiActions {
    ChangeContactFormId = 'UI/CONTACTFORM/CHANGE_ID',
}

export type ChangeContactFormId = PayloadActionCreator<
    number | null,
    UiActions.ChangeContactFormId
>

export type ContactFormState = {
    currentId: number | null
}
