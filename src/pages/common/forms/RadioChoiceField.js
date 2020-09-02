// @flow

import React from 'react'
import classnames from 'classnames'

import radioChecked from '../../../../img/icons/radio-checked.svg'
import radioUnchecked from '../../../../img/icons/radio-unchecked.svg'

import css from './RadioChoiceField.less'

type Choice = {
    value: string,
    label: string,
}

type Props = {
    value: string,
    choices: Array<Choice>,
    onChange: (label: string) => void,
}

export default function RadioChoiceField({value, choices, onChange}: Props) {
    return (
        <div className={css.container}>
            {choices.map((choice) => (
                <RadioChoice
                    key={choice.value}
                    value={choice.value}
                    label={choice.label}
                    isSelected={choice.value === value}
                    onClick={onChange}
                />
            ))}
        </div>
    )
}

type ChoiceProps = {
    value: string,
    label: string,
    isSelected: boolean,
    onClick: (value: string) => void,
}

function RadioChoice({value, label, isSelected, onClick}: ChoiceProps) {
    return (
        <div
            tabIndex={0}
            className={classnames(css.choice, {[css.selected]: isSelected})}
            onClick={() => onClick(value)}
        >
            <img
                src={isSelected ? radioChecked : radioUnchecked}
                alt={isSelected ? 'Checked' : 'Unchecked'}
            />
            {label}
        </div>
    )
}
