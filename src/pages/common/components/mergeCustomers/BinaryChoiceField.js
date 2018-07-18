import React, {PropTypes} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _noop from 'lodash/noop'
import {FormGroup} from 'reactstrap'

/**
 * Allow to pick values from multiples sources and build a single one.
 * Only one value can be picked from each source
 * ex: used in merge customers feature for merging names
 */
const BinaryChoiceField = ({value, options, label, tooltip, onChange}) => {
    const firstOption = {
        label: typeof options[0] === 'object' ? options[0].label : options[0],
        value: typeof options[0] === 'object' ? options[0].value : options[0]
    }

    const firstIsDisabled = !firstOption.value
    firstOption.className = classNames('option', {
        active: _isEqual(value, firstOption.value),
        disabled: firstIsDisabled
    })

    const secondOption = {
        label: typeof options[1] === 'object' ? options[1].label : options[1],
        value: typeof options[1] === 'object' ? options[1].value : options[1]
    }

    const secondIsDisabled = !secondOption.value
    secondOption.className = classNames('option', {
        active: _isEqual(value, secondOption.value),
        disabled: secondIsDisabled
    })

    return (
        <FormGroup className="binary-choice">
            {
                label && (
                    <div className="label">{label}{tooltip}</div>
                )
            }
            <div className="options">
                <div
                    className={firstOption.className}
                    onClick={!firstIsDisabled ? () => onChange(firstOption.value) : null}
                >
                    {firstOption.label || '(no value)'}
                </div>
                <div
                    className={secondOption.className}
                    onClick={!secondIsDisabled ? () => onChange(secondOption.value) : null}
                >
                    {secondOption.label || '(no value)'}
                </div>
            </div>
        </FormGroup>
    )
}

BinaryChoiceField.defaultProps = {
    onChange: _noop
}

BinaryChoiceField.propTypes = {
    label: PropTypes.string,
    options: PropTypes.array.isRequired,
    tooltip: PropTypes.object,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    onChange: PropTypes.func
}

export default BinaryChoiceField
