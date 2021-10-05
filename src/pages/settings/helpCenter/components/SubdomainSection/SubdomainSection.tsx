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
        <section className={css.container}>
            <div className={css.header}>
                <div className={css.title}>Subdomain</div>
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
            <SubdomainInput {...inputProps} />
            {children}
        </section>
    )
}
