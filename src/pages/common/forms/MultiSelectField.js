// @flow
import React, {type ComponentType} from 'react'

import MultiSelectOptionsField, {type Option} from './MultiSelectOptionsField'

type Props = {
    allowCustomValues: boolean,
    options: Option[],
    plural: string,
    singular: string,
    style?: {},
    tagColor: string,
    values: any[],
    className?: string,
    caseInsensitive?: boolean,
    onChange: any[] => void,
    dropdownMenu?: ComponentType<*>
}

// Deprecated: Use MultiSelectOptionsField instead
export default class MultiSelectField extends React.Component<Props> {
    static defaultProps = {
        allowCustomValues: false,
        options: [],
        plural: 'items',
        singular: 'item',
        tagColor: '#0275d8',
        values: []
    }

    _onChange = (options: Option[]) => {
        const selectedValues = options.map((option: Option) => option.value)
        this.props.onChange(selectedValues)
    }

    render() {
        const selectedOptions: Option[] = this.props.values.map((value: any) => {
            return this.props.options.find((option: Option) => option.value === value) || {
                value,
                label: value
            }
        })
        return (
            <MultiSelectOptionsField
                allowCustomOptions={this.props.allowCustomValues}
                options={this.props.options}
                plural={this.props.plural}
                singular={this.props.singular}
                tagColor={this.props.tagColor}
                selectedOptions={selectedOptions}
                onChange={this._onChange}
                style={this.props.style}
                className={this.props.className}
                caseInsensitive={this.props.caseInsensitive}
                dropdownMenu={this.props.dropdownMenu}
                matchInput
            />
        )
    }
}
