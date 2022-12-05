import React, {ReactNode} from 'react'

import {SubdomainInput, SubdomainInputProps} from './components/SubdomainInput'

type Props = Pick<
    SubdomainInputProps,
    'value' | 'placeholder' | 'onChange' | 'error' | 'caption'
> & {
    children?: ReactNode
}

export const SubdomainSection = ({
    children,
    ...inputProps
}: Props): JSX.Element => {
    return (
        <section className="mb-4">
            <SubdomainInput {...inputProps} />
            {children}
        </section>
    )
}
