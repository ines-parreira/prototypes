import React, {ReactNode} from 'react'

import {SubdomainInput, SubdomainInputProps} from './components/SubdomainInput'
import css from './SubdomainSection.less'

type Props = Pick<
    SubdomainInputProps,
    'value' | 'placeholder' | 'onChange' | 'error'
> & {
    href: string
    children?: ReactNode
}

export const SubdomainSection = ({
    href,
    children,
    ...inputProps
}: Props): JSX.Element => {
    return (
        <section>
            <div className={css.header}>
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
                We generated a unique subdomain where your Help Center will be
                accessible. You can edit it below to customize according to your
                preferences.
            </p>
            <SubdomainInput
                {...inputProps}
                className={css['subdomain-margin']}
            />
            {children}
        </section>
    )
}
