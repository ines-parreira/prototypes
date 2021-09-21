import React, {FunctionComponent} from 'react'
import classNames from 'classnames'

import InputField from '../../../../../../common/forms/InputField.js'
import Tooltip from '../../../../../../common/components/Tooltip'

import {HELP_CENTER_DOMAIN} from '../../../../constants'

import css from './SubdomainInput.less'

type SubdomainInputProps = {
    label?: string
    help?: string
    name?: string
    hasError?: boolean
    placeholder?: string
    value?: string
    onChange: (value: string) => void
}

export const SubdomainInput: FunctionComponent<SubdomainInputProps> = ({
    label = 'Subdomain',
    help,
    name = 'subdomain',
    hasError = false,
    value,
    placeholder,
    onChange,
}: SubdomainInputProps) => {
    const helpContent = hasError ? (
        <div className={css.errorContainer}>
            <span
                data-testid="error-message"
                className={css.errorMessage}
                id="error-policy"
            >
                <i className="material-icons">error_outline</i>
                Subdomain is invalid or contains forbidden keywords
            </span>
            <Tooltip target="error-policy" placement="bottom-start">
                <ul data-testid="error-policy" className={css.policy}>
                    <li>- should have less than 63 characters</li>
                    <li>- must begin and end with a letter or number</li>
                    <li>- may contain hyphens (dashes)</li>
                    <li>- may not begin or end with a hyphen</li>
                </ul>
            </Tooltip>
        </div>
    ) : (
        help
    )
    return (
        <InputField
            className={classNames(css.subdomainInput, {
                [css.error]: hasError,
            })}
            type="text"
            name={name}
            label={label}
            help={helpContent}
            placeholder={placeholder}
            rightAddon={HELP_CENTER_DOMAIN}
            value={value}
            onChange={onChange}
        />
    )
}
