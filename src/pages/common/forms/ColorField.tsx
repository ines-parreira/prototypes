import React from 'react'
import _omit from 'lodash/omit'

import ColorPicker, {
    Props as ColorPickerProps,
} from '../components/ColorPicker/ColorPicker'

import DEPRECATED_InputField, {InputFieldProps} from './DEPRECATED_InputField'

type Props = ColorPickerProps & InputFieldProps<string>

export default class ColorField extends DEPRECATED_InputField<Props> {
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
