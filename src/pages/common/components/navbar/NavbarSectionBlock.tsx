import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './NavbarSectionBlock.less'

type Props = {
    name: string
    isExpanded: boolean
    children: ReactNode
    onToggle: () => void
    icon?: ReactNode
}

const NavbarSectionBlock = ({
    name,
    isExpanded,
    children,
    onToggle,
    icon,
}: Props) => {
    return (
        <>
            <div
                className={classnames(
                    css.section,
                    'd-flex align-items-center flex-grow'
                )}
            >
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
                <div
                    onClick={onToggle}
                    className={classnames(
                        css.nameWrapper,
                        'd-flex align-items-center flex-grow'
                    )}
                    title={name}
                >
                    {icon && <div className={css.iconWrapper}>{icon}</div>}
                    <span className={css.name}>{name}</span>
                </div>
            </div>
            {isExpanded && children}
        </>
    )
}

export default NavbarSectionBlock
