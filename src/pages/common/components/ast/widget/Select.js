// @flow
import React from 'react'
import {List, Map, fromJS} from 'immutable'

import InputField from '../../../forms/InputField'

type Props = {
    onChange: () => void,
    options: Array<*> | List<*>,
    value: any,
}

export default class Select extends React.Component<Props> {
    _getOptions = () => {
        const {options} = this.props

        const _options = []

        if (options) {
            if (Array.isArray(options) || List.isList(options)) {
                const immutableOptions = fromJS(options)

                if (
                    !immutableOptions.isEmpty() &&
                    Map.isMap(immutableOptions.get(0))
                ) {
                    // if options is of format: [{value: v, label: l}, {value: v, label: l}]
                    immutableOptions.map((option) =>
                        _options.push(option.toJS())
                    )
                } else {
                    // if options is of format: [value, value, value]
                    immutableOptions.map((option) =>
                        _options.push({value: option, label: option})
                    )
                }
            }
        }

        return _options
    }

    render() {
        const {onChange, value} = this.props
        const options = this._getOptions()

        return (
            <InputField type="select" value={value} onChange={onChange} inline>
                {options.map((option, idx) => (
                    <option key={idx} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </InputField>
        )
    }
}
