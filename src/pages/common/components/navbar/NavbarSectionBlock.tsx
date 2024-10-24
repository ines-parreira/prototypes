import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './NavbarSectionBlock.less'

type Props = {
    className?: string
    name: string
    isExpanded: boolean
    children: ReactNode
    onToggle: () => void
    icon?: ReactNode
}

const NavbarSectionBlock = ({
    className,
    name,
    isExpanded,
    children,
    onToggle,
    icon,
}: Props) => {
    return (
        <>
            <div className={classnames(css.section, className)}>
                <div className={css.toggleSectionIconWrapper}>
                    <i
                        onClick={onToggle}
                        className={classnames(
                            css.toggleSectionIcon,
                            'material-icons'
                        )}
                    >
                        {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                    </i>
                </div>
                <div onClick={onToggle} className={css.nameWrapper}>
                    {icon && <div className={css.iconWrapper}>{icon}</div>}
                    <span className={css.name}>{name}</span>
                </div>
            </div>
            {isExpanded && children}
        </>
    )
}

export default NavbarSectionBlock
