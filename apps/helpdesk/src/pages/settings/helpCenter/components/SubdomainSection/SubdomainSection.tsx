import type { ReactNode } from 'react'
import React from 'react'

import type { SubdomainInputProps } from './components/SubdomainInput'
import { SubdomainInput } from './components/SubdomainInput'

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
