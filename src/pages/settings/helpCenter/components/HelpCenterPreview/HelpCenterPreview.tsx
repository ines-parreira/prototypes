import React, {ReactNode} from 'react'
import classnames from 'classnames'
import css from './HelpCenterPreview.less'

type Props = {
    children: ReactNode
    name: string
    logoUrl?: string | null
}

const HelpCenterPreview = ({children, name, logoUrl}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.header}>
                {logoUrl ? (
                    <div className={css.name}>
                        <img
                            className={css.logo}
                            src={logoUrl}
                            alt="Help Center Logo"
                        />
                    </div>
                ) : (
                    <div className={css.name}>{name}</div>
                )}
                <i className={classnames('material-icons-outlined', css.menu)}>
                    menu
                </i>
            </div>
            <div className={css.content}>{children}</div>
        </div>
    )
}

export default HelpCenterPreview
