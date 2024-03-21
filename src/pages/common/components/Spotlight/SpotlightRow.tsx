import React, {ReactNode, MouseEvent, useContext} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {isMacOs} from 'utils/platform'

import css from './SpotlightRow.less'

type SpotlightRowProps = {
    icon?: ReactNode
    title: string
    info: ReactNode
    link: string
    onCloseModal: () => void
    onHover?: (e: MouseEvent) => void
    selected?: boolean
    shrinkInfo?: boolean
    id: number
    index: number
    onClick?: (e: MouseEvent) => void
}

const SpotlightRow = ({
    title,
    info,
    link,
    icon,
    onCloseModal,
    onHover,
    selected = false,
    shrinkInfo = false,
    id,
    index,
    onClick,
}: SpotlightRowProps) => {
    const searchRank = useContext(SearchRankScenarioContext)

    const handleClick = (e: MouseEvent) => {
        onClick?.(e)
        searchRank?.registerResultSelection({id, index})
        if (isMacOs ? !e.metaKey : !e.ctrlKey) {
            onCloseModal()
        }
    }

    return (
        <Link
            className={classnames(css.container, {
                [css.selected]: selected,
                [css.shrinkInfo]: shrinkInfo,
            })}
            to={link}
            onClick={handleClick}
            onMouseEnter={onHover}
        >
            {!!icon && <div className={css.icon}>{icon}</div>}
            <span className={css.title}>{title}</span>
            <div className={css.separator} />
            <span className={css.info}>{info}</span>
            {selected && (
                <ShortcutIcon className={css.arrowIcon} fillStyle="ghost">
                    ↩
                </ShortcutIcon>
            )}
        </Link>
    )
}

export default SpotlightRow
