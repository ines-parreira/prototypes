import React, {FunctionComponent, useMemo} from 'react'
import classNames from 'classnames'

import Tooltip from '../../../../../../common/components/Tooltip'
import InputField from '../../../../../../common/forms/InputField.js'
import {HELP_CENTER_DOMAIN} from '../../../../constants'

import css from './SubdomainInput.less'

export type SubdomainInputProps = {
    label?: string
    help?: string
    name?: string
    isValid?: boolean
    isAvailable?: boolean
    placeholder?: string
    value?: string
    onChange: (value: string) => void
}

export const SubdomainInput: FunctionComponent<SubdomainInputProps> = ({
    label = 'Subdomain',
    help,
    name = 'subdomain',
    isValid = true,
    isAvailable = true,
    value,
    placeholder,
    onChange,
}: SubdomainInputProps) => {
    const error = useMemo(() => {
        if (!isValid) {
            return (
                <div className={css.errorContainer}>
                    <span
                        data-testid="error-message"
                        className={css.errorMessage}
                        id="error-policy"
                    >
                        <i className="material-icons">error_outline</i>
                        Subdomain is invalid or contains forbidden keywords
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

        if (!isAvailable) {
            return (
                <p className={css.errorMessage}>
                    This help center subdomain is already taken
                </p>
            )
        }

        return null
    }, [isValid, isAvailable])

    return (
        <InputField
            className={classNames(css.subdomainInput, {
                [css.error]: !!error,
            })}
            type="text"
            name={name}
            label={label}
            help={error || help}
            placeholder={placeholder}
            rightAddon={HELP_CENTER_DOMAIN}
            value={value}
            onChange={onChange}
        />
    )
}
