import React from 'react'
import PropTypes from 'prop-types'

export default class FormField extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool,
        error: PropTypes.string,
        help: PropTypes.node,
        label: PropTypes.string,
        name: PropTypes.string,
        onChange: PropTypes.func,
        required: PropTypes.bool,
        value: PropTypes.any,
    }

    static defaultProps = {
        disabled: false,
        required: false,
    }
}
