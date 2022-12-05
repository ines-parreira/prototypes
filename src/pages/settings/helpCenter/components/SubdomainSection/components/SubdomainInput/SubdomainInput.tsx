import React, {useMemo} from 'react'
import classNames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {HELP_CENTER_DOMAIN} from 'pages/settings/helpCenter/constants'
import {isValidSubdomain} from 'pages/settings/helpCenter/utils/validations'

import css from './SubdomainInput.less'

export type SubdomainInputProps = {
    label?: string
    caption?: string
    tooltip?: string
    name?: string
    placeholder?: string
    value?: string
    onChange: (value: string) => void
    error?: string | null
    className?: string
}

export const SubdomainInput: React.FC<SubdomainInputProps> = ({
    label = 'Subdomain',
    caption,
    tooltip,
    name = 'subdomain',
    value = '',
    placeholder,
    onChange,
    error = null,
    className,
}: SubdomainInputProps) => {
    const help = useMemo(() => {
        if (!error) return caption

        if (typeof value === 'string' && !isValidSubdomain(value)) {
            return (
                <div>
                    <span
                        id="error-policy"
                        className={css.error}
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
                        <span>Valid subdomain criterias:</span>
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
            <span className={css.error} data-testid="error-message">
                {error}
            </span>
        )
    }, [value, error, caption])

    return (
        <DEPRECATED_InputField
            className={classNames(
                css.input,
                {
                    [css.error]: !!error,
                },
                className
            )}
            type="text"
            label={label}
            name={name}
            help={help}
            tooltip={tooltip}
            placeholder={placeholder}
            caption={caption}
            rightAddon={HELP_CENTER_DOMAIN}
            value={value}
            onChange={onChange}
        />
    )
}
