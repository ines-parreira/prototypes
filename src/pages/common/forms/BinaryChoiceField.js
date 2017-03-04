import React, {PropTypes} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Allow to pick values from multiples sources and build a single one.
 * Only one value can be picked from each source
 * ex: used in merge users feature for merging names
 */
const BinaryChoiceField = ({input, options, meta, label, type, tooltip}) => {
    if (type === 'json' && input.value === '') {
        // Unfortunately necessary because of https://github.com/erikras/redux-form/issues/2062
        input.value = null
    }

    const firstOption = {
        label: typeof options[0] === 'object' ? options[0].label : options[0],
        value: typeof options[0] === 'object' ? options[0].value : options[0]
    }

    const firstIsDisabled = !firstOption.value
    firstOption.className = classNames('option', {
        active: _isEqual(input.value, firstOption.value),
        disabled: firstIsDisabled
    })

    const secondOption = {
        label: typeof options[1] === 'object' ? options[1].label : options[1],
        value: typeof options[1] === 'object' ? options[1].value : options[1]
    }

    const secondIsDisabled = !secondOption.value
    secondOption.className = classNames('option', {
        active: _isEqual(input.value, secondOption.value),
        disabled: secondIsDisabled
    })

    return (
        <div className="ui field binary-choice">
            {
                label && (
                    <div className="label">{label}{tooltip}</div>
                )
            }
            <div className="options">
                <div
                    className={firstOption.className}
                    onClick={!firstIsDisabled ? () => input.onChange(firstOption.value) : null}
                >
                    {firstOption.label || '(no value)'}
                </div>
                <div
                    className={secondOption.className}
                    onClick={!secondIsDisabled ? () => input.onChange(secondOption.value) : null}
                >
                    {secondOption.label || '(no value)'}
                </div>
            </div>
            {meta.invalid && <ErrorMessage errors={meta.error} />}
            {meta.touched && <ErrorMessage errors={meta.warning} isWarning />}
        </div>
    )
}

BinaryChoiceField.defaultProps = {
    type: 'text'
}

BinaryChoiceField.propTypes = {
    type: PropTypes.string.isRequired,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    options: PropTypes.array.isRequired,
    tooltip: PropTypes.object
}

export default BinaryChoiceField
