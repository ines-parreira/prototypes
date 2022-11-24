import React, {ReactNode} from 'react'

import css from './VerificationCard.less'

type Props = {
    header?: ReactNode
    body?: ReactNode
    footer?: ReactNode
    bodyActions?: ReactNode
}

export default function VerificationCard({
    header,
    body,
    bodyActions,
    footer,
}: Props) {
    return (
        <div className={css.card}>
            <div className="d-flex align-items-center">
                <div>
                    <div className={css.cardHeader}>{header}</div>
                    <div className={css.cardBody}>{body}</div>
                </div>
                {bodyActions && <div className="ml-4">{bodyActions}</div>}
            </div>
            <div className={css.cardFooter}>{footer}</div>
        </div>
    )
}
