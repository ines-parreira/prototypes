import {Component, ReactNode} from 'react'

type OwnProps = {
    className?: string
    disabled?: boolean
    error?: string | null
    help?: ReactNode
    label?: ReactNode
    name?: string
    onChange?: (value: any) => void
    required?: boolean
    value?: any
    children?: ReactNode
    inline?: boolean
    placeholder?: ReactNode
    type?: string
    leftAddon?: string
    rightAddon?: string
    caseInsensitive?: boolean
}

export default class InputField<Props, State> extends Component<
    OwnProps & Props,
    State
> {
    constructor(props: Props)
}
