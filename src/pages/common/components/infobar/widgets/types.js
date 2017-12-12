// @flow
export type ParameterType = {
    name: string,
    type: string,
    label?: string,
    defaultValue?: string | number | boolean | null,
    placeholder?: string,
    required?: boolean,
    step?: number,
    min?: number,
    max?: number,
}

export type OptionType = {
    value: string,
    label?: string,
    parameters?: Array<ParameterType>
}

export type ActionType = {
    key: string,
    options: Array<OptionType>,
    title: Object,
    child: Object,
    tooltip?: string
}
