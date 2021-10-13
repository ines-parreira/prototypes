import React, {ComponentType, CSSProperties} from 'react'

import MultiSelectOptionsField from './MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from './MultiSelectOptionsField/types'

type Props = {
    allowCustomValues: boolean
    options: Option[]
    plural: string
    singular: string
    style?: CSSProperties
    values: any[] | null
    className?: string
    caseInsensitive?: boolean
    onChange: (options: any[]) => void
    dropdownMenu?: ComponentType<unknown>
    isCompact?: boolean
}

// Deprecated: Use MultiSelectOptionsField instead
export default class MultiSelectField extends React.Component<Props> {
    static defaultProps = {
        allowCustomValues: false,
        options: [],
        plural: 'items',
        singular: 'item',
        values: [],
    }

    _onChange = (options: Option[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const selectedValues = options.map((option: Option) => option.value)
        this.props.onChange(selectedValues)
    }

    render() {
        const selectedOptions: Option[] = (this.props.values || []).map(
            (value) => {
                return (
                    this.props.options.find(
                        (option: Option) => option.value === value
                    ) || {
                        value,
                        label: value,
                    }
                )
            }
        )
        return (
            <MultiSelectOptionsField
                allowCustomOptions={this.props.allowCustomValues}
                options={this.props.options}
                plural={this.props.plural}
                singular={this.props.singular}
                selectedOptions={selectedOptions}
                onChange={this._onChange}
                style={this.props.style}
                className={this.props.className}
                caseInsensitive={this.props.caseInsensitive}
                dropdownMenu={this.props.dropdownMenu}
                matchInput
                isCompact={this.props.isCompact}
            />
        )
    }
}
