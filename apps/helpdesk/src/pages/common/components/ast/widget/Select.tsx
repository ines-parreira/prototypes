import { Component } from 'react'

import { fromJS, List, Map } from 'immutable'

import DEPRECATED_InputField from '../../../forms/DEPRECATED_InputField'
import type { SelectableOption as SelectOption } from '../../../forms/SelectField/types'

type Props = {
    onChange: () => void
    options: Array<SelectOption> | List<any>
    value: any
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<SelectField />` from @gorgias/axiom instead.
 * @date 2026-01-06
 * @type ui-kit-migration
 */
export default class Select extends Component<Props> {
    _getOptions = () => {
        const { options } = this.props

        const _options: SelectOption[] = []

        if (options) {
            if (Array.isArray(options) || List.isList(options)) {
                const immutableOptions = fromJS(options) as List<any>

                if (
                    !immutableOptions.isEmpty() &&
                    Map.isMap(immutableOptions.get(0))
                ) {
                    // if options is of format: [{value: v, label: l}, {value: v, label: l}]
                    immutableOptions.map((option: Map<any, any>) =>
                        _options.push(option.toJS()),
                    )
                } else {
                    // if options is of format: [value, value, value]
                    immutableOptions.map((option) =>
                        _options.push({ value: option, label: option }),
                    )
                }
            }
        }

        return _options
    }

    render() {
        const { onChange, value } = this.props
        const options = this._getOptions()

        return (
            <DEPRECATED_InputField
                type="select"
                value={value}
                onChange={onChange}
                inline
            >
                {options.map((option, idx) => (
                    <option key={idx} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </DEPRECATED_InputField>
        )
    }
}
