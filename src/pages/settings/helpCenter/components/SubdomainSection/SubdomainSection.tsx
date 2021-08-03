import React from 'react'
import classNames from 'classnames'
import {Input, InputGroup, InputGroupAddon} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip'

import {HELP_CENTER_DOMAIN} from '../../constants'

import css from './SubdomainSection.less'

type Props = {
    value: string
    domain?: string
    hasError?: boolean
    href: string
    placeholder?: string
    onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
}

export const SubdomainSection = ({
    value,
    domain = HELP_CENTER_DOMAIN,
    hasError = false,
    href,
    placeholder,
    onBlur,
    onChange,
}: Props) => {
    return (
        <section className={css['subdomain-content']}>
            <div className={css.title}>
                <h4>Subdomain</h4>
                <a
                    className={css.anchor}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Live Site
                    <i className="material-icons">launch</i>
                </a>
            </div>
            <p>
                We generated a unique subdomain based on this name where the
                Help Center website will be accessible. You can change it to
                better match your needs.
            </p>
            <h5>Subdomain</h5>
            <InputGroup style={{width: 320}}>
                <Input
                    data-testid="subdomain-input"
                    className={classNames(css['subdomain-input'], {
                        [css.error]: hasError,
                    })}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                />
                <InputGroupAddon addonType="append">
                    <span
                        data-testid="domain-name"
                        className={classNames(css.domain, {
                            [css.error]: hasError,
                        })}
                    >
                        {domain}
                    </span>
                </InputGroupAddon>
            </InputGroup>
            {hasError && (
                <div className={css['error-container']}>
                    <span
                        data-testid="error-message"
                        className={css['error-message']}
                        id="error-policy"
                    >
                        <i className="material-icons">error_outline</i>
                        Subdomain is invalid or contains forbidden keywords
                    </span>
                    <Tooltip target="error-policy" placement="bottom-start">
                        <ul data-testid="error-policy" className={css.policy}>
                            <li>- should have less than 63 characters</li>
                            <li>
                                - must begin and end with a letter or number
                            </li>
                            <li>- may contain hyphens (dashes)</li>
                            <li>- may not begin or end with a hyphen</li>
                        </ul>
                    </Tooltip>
                </div>
            )}
        </section>
    )
}
