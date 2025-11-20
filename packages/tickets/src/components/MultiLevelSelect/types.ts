import type { BACK_BUTTON_ID, CLEAR_BUTTON_ID } from './constants'

export enum OptionEnum {
    Option = 'option',
    Back = 'back',
    Clear = 'clear',
}

export type TreeValue = string

export type TreeOption = {
    type: OptionEnum.Option
    id: string
    label: string
    value: TreeValue
    path: string[]
    hasChildren: boolean
    caption?: string
}

export type BackButtonOption = {
    type: OptionEnum.Back
    id: typeof BACK_BUTTON_ID
    label: string
}

export type ClearButtonOption = {
    type: OptionEnum.Clear
    id: typeof CLEAR_BUTTON_ID
    label: string
}

export type Option = TreeOption | BackButtonOption | ClearButtonOption
