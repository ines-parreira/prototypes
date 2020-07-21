export type Option = {
    description?: string
    key: string
    label: string
}

export type OptionGroup = {
    key: string
    label: string
    options: Option[]
}
