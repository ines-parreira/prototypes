import classNames from 'classnames'
import React, {ReactNode} from 'react'

import css from './VerificationCard.less'

type Props = {
    header?: ReactNode
    body?: ReactNode
    footer?: ReactNode
    bodyActions?: ReactNode
    isDisabled?: boolean
}

export default function VerificationCard({
    header,
    body,
    bodyActions,
    footer,
    isDisabled,
}: Props) {
    return (
        <div className={classNames(css.card, {[css.transparent]: isDisabled})}>
            <div className="d-flex align-items-center justify-content-between">
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
