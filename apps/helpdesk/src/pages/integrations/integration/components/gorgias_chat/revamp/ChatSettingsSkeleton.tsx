import type { ReactNode } from 'react'

import { Skeleton } from '@gorgias/axiom'

import css from './ChatSettingsSkeleton.less'

type Props = {
    children: ReactNode
}

export const ChatSettingsSkeleton = ({ children }: Props) => {
    return (
        <div className={`full-width ${css.container}`}>
            <div className={css.pageHeader}>
                <Skeleton height="16px" width="200px" />
                <div className={css.titleRow}>
                    <div className={css.titleLeft}>
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="100px" />
                    </div>
                    <Skeleton height="36px" width="72px" />
                </div>
            </div>
            <div className={css.navbar}>
                <Skeleton height="16px" width="80px" />
                <Skeleton height="16px" width="80px" />
                <Skeleton height="16px" width="80px" />
                <Skeleton height="16px" width="80px" />
                <Skeleton height="16px" width="80px" />
            </div>
            {children}
        </div>
    )
}
