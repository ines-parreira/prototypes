import {Component, ReactNode} from 'react'
import {InputProps} from 'reactstrap'

interface OwnProps extends InputProps {
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
    leftAddon?: string
    rightAddon?: string
    caseInsensitive?: boolean
    tooltip?: string
    tooltipIcon?: ReactNode
    suffix?: string
}

export default class InputField<Props, State> extends Component<
    OwnProps & Props,
    State
> {
    id?: string
    constructor(props: Props)
}
