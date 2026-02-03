export enum OptionEnum {
    Option = 'option',
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

export type NavigationState = {
    canGoBack: boolean
    parentLevelName: string | null
}
