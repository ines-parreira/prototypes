import React from 'react'
import classnames from 'classnames'
import {Collapse} from 'reactstrap'
import {assetsUrl} from 'utils'
import Avatar from 'pages/common/components/Avatar/Avatar'
import css from './InTicketSuggestionContainer.less'

type Props = {
    children?: React.ReactNode
    className?: string
    collapse?: boolean
    onCollapse?: () => void
}

export default function InTicketSuggestionContainer({
    children,
    className,
    collapse = false,
    onCollapse,
}: Props) {
    return (
        <Collapse
            className={classnames(css.container, className)}
            isOpen={!collapse}
            onClosed={onCollapse}
        >
            <div className={css.avatar}>
                <Avatar
                    name="Gorgias Tips"
                    size={36}
                    url={assetsUrl('/img/icons/gorgias-icon-logo-white.png')}
                />
            </div>
            {children}
        </Collapse>
    )
}
