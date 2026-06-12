import type { ReactNode } from 'react'
import React, { Component } from 'react'

import classNames from 'classnames'
import { FormGroup } from 'reactstrap'
import { compact, isEqual, isUndefined, noop, pick } from '@gorgias/toolkit'

import type {
    CustomerChannel,
    MultiSelectBinaryChoiceFieldOption,
} from '../../../models/customerChannel/types'

/**
 * Allow to pick values from multiples sources and build a single one.
 * Multiple values can be picked from each source
 * ex: used in merge customers feature for merging channels
 */

type Props = {
    value: CustomerChannel[]
    label?: string
    options: Array<Array<MultiSelectBinaryChoiceFieldOption>>
    requiredValues: CustomerChannel[]
    tooltip?: ReactNode
    propertiesToCompare: string[]
    onChange: (channels: CustomerChannel[]) => void
}

class MultiSelectBinaryChoiceField extends Component<Props> {
    static defaultProps: Pick<Props, 'propertiesToCompare' | 'onChange'> = {
        propertiesToCompare: [],
        onChange: noop,
    }
    componentDidUpdate(prevProps: Props) {
        if (
            isEqual(prevProps.requiredValues, this.props.requiredValues) &&
            isEqual(prevProps.value, this.props.value)
        ) {
            return
        }

        const { requiredValues } = this.props
        const activeIds = this.props.value.map(
            (channel: CustomerChannel) => channel.id,
        )

        // Force selection of non-selected required values
        requiredValues.forEach((requiredValue) => {
            if (!activeIds.includes(requiredValue.id)) {
                this._onChange(requiredValue, true)
            }
        })
    }

    _onChange(value: CustomerChannel, forceAdd = false) {
        if (isUndefined(value)) {
            return
        }

        const newVal = compact(this.props.value) || []

        // compare whole value by default
        let referenceValue: Partial<CustomerChannel> = value

        // reduce properties to compare in value to get a match
        if (this.props.propertiesToCompare.length) {
            referenceValue = pick(value, this.props.propertiesToCompare)
        }

        const index = newVal.findIndex((item) =>
            Object.entries(referenceValue).every(
                ([key, value]) => item[key as keyof CustomerChannel] === value,
            ),
        )

        if (index === -1) {
            // if property not in list, add
            newVal.push(value)
        } else if (!forceAdd) {
            // if property is already in list, remove it
            newVal.splice(index, 1)
        }

        this.props.onChange(newVal)
    }

    _expandOptionsSet = (
        optionSet: Array<MultiSelectBinaryChoiceFieldOption>,
    ) => {
        const requiredValuesIds = this.props.requiredValues.map(
            (requiredValue) => requiredValue.id,
        )

        return optionSet.map((option, idx) => {
            const active = this.props.value.find((channel) =>
                isEqual(channel, option.value),
            )
            const disabled = requiredValuesIds.includes(option.value.id)
            const className = classNames({ active, disabled }, 'option')

            return (
                <div
                    key={idx}
                    className={className}
                    onClick={
                        disabled
                            ? undefined
                            : () => this._onChange(option.value)
                    }
                >
                    {option.label}
                </div>
            )
        })
    }

    render() {
        const { options, label, tooltip } = this.props

        return (
            <FormGroup className="multi-select-binary-choice">
                {label && (
                    <div className="label">
                        {label}
                        {tooltip}
                    </div>
                )}
                <div className="options">
                    {options.map((option, idx) => (
                        <div className="option-container" key={idx}>
                            {this._expandOptionsSet(option)}
                        </div>
                    ))}
                </div>
            </FormGroup>
        )
    }
}

export { MultiSelectBinaryChoiceField }
