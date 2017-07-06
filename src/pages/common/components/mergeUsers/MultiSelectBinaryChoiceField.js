import React, {PropTypes} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import _forEach from 'lodash/forEach'
import _pick from 'lodash/pick'
import _compact from 'lodash/compact'
import _isUndefined from 'lodash/isUndefined'
import _noop from 'lodash/noop'
import {FormGroup} from 'reactstrap'

/**
 * Allow to pick values from multiples sources and build a single one.
 * Multiple values can be picked from each source
 * ex: used in merge users feature for merging channels
 */
class MultiSelectBinaryChoiceField extends React.Component {
    componentWillReceiveProps(nextProps) {
        const {requiredValues} = nextProps
        const activeIds = this.props.value.map((channel) => channel.id)

        // Force selection of non-selected required values
        _forEach(requiredValues, (requiredValue) => {
            if (!activeIds.includes(requiredValue.id)) {
                this._onChange(requiredValue, true)
            }
        })
    }

    _onChange(value, forceAdd = false) {
        if (_isUndefined(value)) {
            return
        }

        const newVal = _compact(this.props.value) || []

        // compare whole value by default
        let referenceValue = value

        // reduce properties to compare in value to get a match
        if (this.props.propertiesToCompare.length) {
            referenceValue = _pick(value, this.props.propertiesToCompare)
        }

        const index = _findIndex(newVal, referenceValue)

        if (index === -1) { // if property not in list, add
            newVal.push(value)
        } else if (!forceAdd) { // if property is already in list, remove it
            newVal.splice(index, 1)
        }

        this.props.onChange(newVal)
    }

    _expandOptionsSet = (optionSet) => {
        const requiredValuesIds = this.props.requiredValues.map((requiredValue) => requiredValue.id)

        return optionSet.map((option, idx) => {
            const active = _find(this.props.value, (channel) => _isEqual(channel, option.value))
            const disabled = requiredValuesIds.includes(option.value.id)
            const className = classNames({active, disabled}, 'option')

            return (
                <div
                    key={idx}
                    className={className}
                    onClick={disabled ? null : () => this._onChange(option.value)}
                >
                    {option.label}
                </div>
            )
        })
    }

    render() {
        const {options, label, tooltip} = this.props

        return (
            <FormGroup className="multi-select-binary-choice">
                {
                    label && (
                        <div className="label">{label}{tooltip}</div>
                    )
                }
                <div className="options">
                    {
                        options.map((option, idx) => (
                            <div
                                className="option-container"
                                key={idx}
                            >
                                {this._expandOptionsSet(option)}
                            </div>
                        ))
                    }
                </div>
            </FormGroup>
        )
    }
}

MultiSelectBinaryChoiceField.propTypes = {
    value: PropTypes.array.isRequired,
    label: PropTypes.string,
    options: PropTypes.array.isRequired,
    requiredValues: PropTypes.array,
    tooltip: PropTypes.object,
    propertiesToCompare: PropTypes.array.isRequired,
    onChange: PropTypes.func
}

MultiSelectBinaryChoiceField.defaultProps = {
    propertiesToCompare: [],
    onChange: _noop
}

export default MultiSelectBinaryChoiceField
