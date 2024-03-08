import React, {ReactNode} from 'react'

import css from './WithRevenuePaywall.less'

type Props = {
    children: ReactNode | ReactNode[]
    showPaywall?: boolean
}

export const WithRevenuePaywall = ({
    children,
    showPaywall,
}: Props): JSX.Element => {
    return (
        <div className={css.wrapper}>
            {children}
            {showPaywall && <div className={css.paywall} />}
        </div>
    )
}
