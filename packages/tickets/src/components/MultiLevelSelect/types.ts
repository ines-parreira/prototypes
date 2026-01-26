import type { BACK_BUTTON_ID } from './constants'

export enum OptionEnum {
    Option = 'option',
    Back = 'back',
}

export type TreeValue = string | boolean

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

export type Option = TreeOption | BackButtonOption
