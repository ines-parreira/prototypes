import React from 'react'
import {assetsUrl} from 'utils'
import Avatar from 'pages/common/components/Avatar/Avatar'
import css from './InTicketSuggestionContainer.less'

type Props = {
    children?: React.ReactNode
}

export default function InTicketSuggestionContainer({children}: Props) {
    return (
        <div className={css.container}>
            <div className={css.avatar}>
                <Avatar
                    name="Gorgias Tips"
                    size={36}
                    url={assetsUrl('/img/icons/gorgias-icon-logo-white.png')}
                />
            </div>
            {children}
        </div>
    )
}
