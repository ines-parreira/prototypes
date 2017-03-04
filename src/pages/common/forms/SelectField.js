import React from 'react'
import {isUndefined as _isUndefined, isString as _isString} from 'lodash'
import classNames from 'classnames'

class SelectField extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            // Semantic UI does not allow to select an empty value
            // lets use a trick to clear the field thanks to a button
            isClearable: false
        }
    }

    componentDidMount() {
        const {input: {value, onChange}, direction} = this.props

        $(this.refs.select)
            .dropdown({
                onChange,
                direction
            })
            .dropdown('set selected', value)

        this._updateIsClearable(value)
    }

    componentWillReceiveProps(nextProps) {
        // when the value comes asynchronously
        const {input: {value}} = nextProps

        $(this.refs.select).dropdown('set selected', value)

        this._updateIsClearable(value)
    }

    /**
     * Set selection to empty value
     * @private
     */
    _clearValue = () => {
        const {input: {onChange}} = this.props

        $(this.refs.select).dropdown('clear')
        onChange('')
    }

    /**
     * Update the ability of the value to be cleared
     * @param value
     * @private
     */
    _updateIsClearable = (value) => {
        const isEmpty = _isUndefined(value) || (_isString(value) && !value)

        this.setState({
            isClearable: !isEmpty
        })
    }

    /**
     * Render the button clearing the value
     * @returns {XML}
     * @private
     */
    _renderClearButton = () => {
        return (
            <i
                className="icon link clear-icon delete"
                onClick={this._clearValue}
            />
        )
    }

    render() {
        const {children, input, multiple, label, inline, placeholder, required, tooltip} = this.props
        let {selectClassName} = this.props
        // we do not deal with value and onChange since Semantic is breaking <select>
        // into its own HTML and JS scripts
        const props = input

        if (required) {
            props.required = true
        }

        const fieldClassName = classNames('field', {
            clearable: !required && this.state.isClearable,
            inline,
            required,
        })

        if (!selectClassName) {
            selectClassName = 'search'
        }

        selectClassName = classNames('ui dropdown', {
            [selectClassName]: true,
            multiple,
        })

        return (
            <div className={fieldClassName}>
                {
                    label && (
                        <label htmlFor={input.name}>
                            {label}
                            {tooltip}
                        </label>
                    )
                }
                <select
                    ref="select"
                    className={selectClassName}
                    {...props}
                    placeholder={placeholder}
                >
                    {!required && <option value=""></option>}
                    {children}
                </select>
                {this._renderClearButton()}
            </div>
        )
    }
}

SelectField.defaultProps = {
    required: false,
    direction: 'auto',
    inline: false,
    multiple: false,
}

SelectField.propTypes = {
    children: React.PropTypes.node,
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
    tooltip: React.PropTypes.node,
    direction: React.PropTypes.string,
    inline: React.PropTypes.bool,
    multiple: React.PropTypes.bool,
    selectClassName: React.PropTypes.string,
}

export default SelectField
