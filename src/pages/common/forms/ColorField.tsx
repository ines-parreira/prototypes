import React from 'react'
import _omit from 'lodash/omit'

import ColorPicker from '../components/ColorPicker'

import InputField, {InputFieldProps} from './InputField'

type Props = InputFieldProps<string>

export default class ColorField extends InputField<Props> {
    _getField = () => {
        const {value, onChange, ...rest} = _omit(this.props, [
            'error',
            'help',
            'inline',
            'label',
            'name',
        ])

        return <ColorPicker value={value} onChange={onChange} {...rest} />
    }
}
