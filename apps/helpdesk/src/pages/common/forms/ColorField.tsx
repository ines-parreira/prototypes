import _omit from 'lodash/omit'

import type { Props as ColorPickerProps } from '../components/ColorPicker/ColorPicker'
import ColorPicker from '../components/ColorPicker/ColorPicker'
import type { InputFieldProps } from './DEPRECATED_InputField'
import DEPRECATED_InputField from './DEPRECATED_InputField'

type Props = ColorPickerProps & InputFieldProps<string>

export default class ColorField extends DEPRECATED_InputField<Props> {
    _getField = () => {
        const { value, onChange, ...rest } = _omit(this.props, [
            'error',
            'help',
            'inline',
            'name',
        ])

        return <ColorPicker value={value} onChange={onChange} {...rest} />
    }
}
