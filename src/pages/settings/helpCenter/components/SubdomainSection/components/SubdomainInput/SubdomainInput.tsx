import React, {FunctionComponent} from 'react'
import classNames from 'classnames'

import Tooltip from '../../../../../../common/components/Tooltip'
import InputField from '../../../../../../common/forms/InputField.js'
import {HELP_CENTER_DOMAIN} from '../../../../constants'
import {isValidSubdomain} from '../../../../utils/validations'

import css from './SubdomainInput.less'

export type SubdomainInputProps = {
    label?: string
    help?: string
    name?: string
    placeholder?: string
    value?: string
    onChange: (value: string) => void
    error?: string | null
}

export const SubdomainInput: FunctionComponent<SubdomainInputProps> = ({
    label = 'Subdomain',
    help,
    name = 'subdomain',
    value,
    placeholder,
    onChange,
    error,
}: SubdomainInputProps) => {
    const renderHelp = () => {
        if (!error) return help

        if (typeof value === 'string' && !isValidSubdomain(value)) {
            return (
                <div>
                    <span
                        id="error-policy"
                        className={css.errorMessage}
                        data-testid="error-message"
                    >
                        <i className="material-icons">error_outline</i>
                        {error}
                    </span>
                    <Tooltip
                        target="error-policy"
                        placement="bottom-start"
                        style={{textAlign: 'left'}}
                    >
                        <ul data-testid="error-policy" className={css.policy}>
                            <li>Should have less than 63 characters</li>
                            <li>Must begin and end with a letter or number</li>
                            <li>May contain hyphens (dashes)</li>
                            <li>May not begin or end with a hyphen</li>
                        </ul>
                    </Tooltip>
                </div>
            )
        }

        return (
            <span className={css.errorMessage} data-testid="error-message">
                {error}
            </span>
        )
    }

    return (
        <InputField
            className={classNames(css.subdomainInput, {
                [css.error]: !!error,
            })}
            type="text"
            name={name}
            label={label}
            help={renderHelp()}
            placeholder={placeholder}
            rightAddon={HELP_CENTER_DOMAIN}
            value={value}
            onChange={onChange}
        />
    )
}
