import React from 'react'

import {SubdomainInput} from './components/SubdomainInput'

import css from './SubdomainSection.less'

type Props = {
    value: string
    hasError?: boolean
    href: string
    placeholder?: string
    onChange: (value: string) => void
}

export const SubdomainSection = ({
    value,
    hasError = false,
    href,
    placeholder,
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
            <SubdomainInput
                hasError={hasError}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </section>
    )
}
