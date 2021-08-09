import {ReactNode} from 'react'

export type Value = number | string

export type SelectableOption = {
    value: Value
    text?: string // text used to filter with the search value
    label?: ReactNode | string // text displayed in the dropdown
    isDeprecated?: boolean // if the option is deprecated
    isDisabled?: boolean // if the option is greyed out and not selectable
    tooltipText?: ReactNode | string // show text or element on option hover
}

export type Option =
    | SelectableOption
    | {label: string; isHeader: true}
    | {isDivider: true}
