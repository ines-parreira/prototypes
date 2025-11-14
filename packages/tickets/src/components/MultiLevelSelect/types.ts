import { BACK_BUTTON_ID, CLEAR_BUTTON_ID } from './constants'

export enum OptionType {
    Option = 'option',
    Back = 'back',
    Clear = 'clear',
}

export type TreeValue = string

export type TreeOption = {
    type: OptionType.Option
    id: string
    label: string
    value: TreeValue
    path: string[]
    hasChildren: boolean
    caption?: string
}

export type BackButtonOption = {
    type: OptionType.Back
    id: typeof BACK_BUTTON_ID
    label: string
}

export type ClearButtonOption = {
    type: OptionType.Clear
    id: typeof CLEAR_BUTTON_ID
    label: string
}

export type Option = TreeOption | BackButtonOption | ClearButtonOption
