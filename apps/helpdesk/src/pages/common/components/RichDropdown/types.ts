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

export function isOptionGroupArray(arg: any): arg is OptionGroup[] {
    return (
        arg instanceof Array &&
        (arg.length === 0 ||
            (arg[0] as Record<string, unknown>).options != null)
    )
}
