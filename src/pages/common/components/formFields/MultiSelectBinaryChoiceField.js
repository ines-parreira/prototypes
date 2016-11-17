import React, {PropTypes} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import _forEach from 'lodash/forEach'
import _compact from 'lodash/compact'


class MultiSelectBinaryChoiceField extends React.Component {
    componentWillReceiveProps(nextProps) {
        const {requiredValue} = nextProps
        let isActive = false

        _forEach(this.props.input.value, channel => {
            if (_isEqual(channel, requiredValue)) {
                isActive = true
            }
        })

        if (this.props.input.value && !isActive) {
            this._onChange(requiredValue, true)
        }
    }

    _onChange(value, forceAdd = false) {
        const newVal = this.props.input.value || []

        const index = _findIndex(_compact(newVal), channel => channel.address === value.address && channel.type === value.type)

        if (index === -1) {
            newVal.push(value)
        } else if (!forceAdd) {
            newVal.splice(index, 1)
        }

        this.props.input.onChange(newVal)
        this.forceUpdate() // force rerender because redux-form doesn't inject the new value
    }

    _expandOptionsSet = (optionSet) => (
        optionSet.map((option, idx) => {
            const active = _find(this.props.input.value, (channel) => _isEqual(channel, option.value))
            const disabled = _isEqual(this.props.requiredValue, option.value)
            const className = classNames({active, disabled}, 'option')

            return (
                <div
                    key={`0-${idx}`}
                    className={className}
                    onClick={disabled ? null : () => this._onChange(option.value)}
                >
                    {option.label}
                </div>
            )
        })
    )

    render() {
        const {options, meta, label, tooltip} = this.props

        return (
            <div className="ui field multi-select-binary-choice">
                {
                    label && (
                        <div className="label">{label}{tooltip}</div>
                    )
                }
                <div className="options">
                    <div className="option-container">
                        {
                            this._expandOptionsSet(options[0])
                        }
                    </div>
                    <div className="option-container">
                        {
                            this._expandOptionsSet(options[1])
                        }
                    </div>
                </div>
                {
                    meta.invalid && meta.error && (
                        <div className="ui error message"><p>{meta.error}</p></div>
                    )
                }
                {
                    meta.touched && meta.warning && (
                        <div className="ui warning message"><p>{meta.warning}</p></div>
                    )
                }
            </div>
        )
    }
}

MultiSelectBinaryChoiceField.propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    options: PropTypes.array.isRequired,
    requiredValue: PropTypes.object,
    tooltip: PropTypes.object
}

export default MultiSelectBinaryChoiceField
