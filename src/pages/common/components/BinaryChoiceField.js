// @flow
import React from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _noop from 'lodash/noop'
import {FormGroup} from 'reactstrap'


type Props = {
    label: ?string,
    options: Array<Object>,
    tooltip: ?Object,
    value: ?string | ?Object | ?number,
    onChange: (string | Object | number) => void,
}

/**
 * Allow to pick values from multiples sources and build a single one.
 * Only one value can be picked from each source
 * ex: used in merge customers feature for merging names
 */
export default class BinaryChoiceField extends React.Component<Props> {
    defaultProps = {
        onChange: _noop
    }

    render () {
        const {value, options, label, tooltip, onChange} = this.props

        const firstValue = typeof options[0] === 'object' ? options[0].value : options[0]
        const firstIsDisabled = !firstValue
        const firstOption = {
            label: options[0] && typeof options[0] === 'object' ? options[0].label : options[0],
            value: firstValue,
            className: classNames('option', {
                active: _isEqual(value, firstValue),
                disabled: firstIsDisabled
            })
        }

        const secondValue = options[1] && typeof options[1] === 'object' ? options[1].value : options[1]
        const secondIsDisabled = !secondValue
        const secondOption = {
            label: typeof options[1] === 'object' ? options[1].label : options[1],
            value: secondValue,
            className: classNames('option', {
                active: _isEqual(value, secondValue),
                disabled: secondIsDisabled
            })

        }

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
}
