import React, {useRef} from 'react'
import classnames from 'classnames'

import {VisibilityStatus} from 'models/helpCenter/types'
import Tooltip from 'pages/common/components/Tooltip'

import css from './VisibilityCell.less'

export type VisibilityCellProps = {
    status: VisibilityStatus
    isParentUnlisted?: boolean
    isArticle?: boolean
}

export const optionsSharingStatus: Record<
    VisibilityStatus,
    {title: string; icon: string}
> = {
    PUBLIC: {
        title: 'Public',
        icon: 'visibility',
    },
    UNLISTED: {
        title: 'Unlisted',
        icon: 'visibility_off',
    },
}

const VisibilityCell = ({
    status = 'PUBLIC',
    isParentUnlisted = false,
    isArticle = false,
}: VisibilityCellProps) => {
    const isPublicUnlisted = isParentUnlisted && status === 'PUBLIC'
    const ref = useRef<HTMLDivElement | null>(null)

    return (
        <div className={css.container}>
            {isPublicUnlisted ? (
                <div className={css.dot} />
            ) : (
                <i className={classnames(css.icon, 'material-icons')}>
                    {optionsSharingStatus[status].icon}
                </i>
            )}

            <div
                ref={ref}
                className={classnames(css.title, {
                    [css.light]: isPublicUnlisted,
                })}
            >
                {optionsSharingStatus[status].title}
            </div>
            {isPublicUnlisted && (
                <Tooltip
                    delay={100}
                    target={ref}
                    placement="top"
                    boundariesElement="body"
                >
                    <div className={css.tooltipContent}>
                        This {isArticle ? 'article' : 'category'} is currently
                        only accessible via direct link because its parent
                        category is unlisted.
                    </div>
                </Tooltip>
            )}
        </div>
    )
}

export default VisibilityCell
