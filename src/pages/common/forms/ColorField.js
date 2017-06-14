import React from 'react'
import InputField from './InputField'

import ColorPicker from '../components/ColorPicker'

export default class ColorField extends InputField {
    _getField = () => {
        const {
            children, // eslint-disable-line
            error, // eslint-disable-line
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            name, // eslint-disable-line
            ...rest,
        } = this.props

        return (
            <ColorPicker
                id={this.id}
                {...rest}
            />
        )
    }
}
