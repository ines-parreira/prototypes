import React, {useState, useEffect, useMemo} from 'react'
import classNames from 'classnames'

import ToggleInput from 'pages/common/forms/ToggleInput'
import Tooltip from 'pages/common/components/Tooltip'

import css from './QuickResponseListItem.less'

interface QuickResponseListItemProps {
    title: string
    enabled: boolean
    isLimitReached: boolean
    position: number
    onEditClick: () => void
    onToggle: () => void
}

const QuickResponseListItem: React.FC<QuickResponseListItemProps> = ({
    title,
    enabled,
    isLimitReached,
    onEditClick,
    onToggle,
}) => {
    const [isLoading, setIsLoading] = useState(false)
    const isDisabled = !enabled && isLimitReached

    const toggleId = useMemo(() => {
        const titleWithoutSpecialCharacters = title.replace(/\W/g, '_')
        // add _ in the beginning to generate a valid CSS selector, title could start with a number
        return `_${titleWithoutSpecialCharacters}`
    }, [title])

    const handleToggle = () => {
        if (isDisabled) {
            return
        }

        setIsLoading(true)
        onToggle()
    }

    useEffect(() => {
        setIsLoading(false)
    }, [enabled])

    return (
        <tr className="draggable" data-id={title}>
            <td>
                <div
                    className={classNames(
                        'material-icons drag-handle',
                        css.dragIcon
                    )}
                >
                    drag_indicator
                </div>
            </td>

            <td>
                <div id={toggleId}>
                    <ToggleInput
                        isToggled={enabled}
                        isDisabled={isDisabled}
                        isLoading={isLoading}
                        onClick={handleToggle}
                    />
                </div>
                {isDisabled && (
                    <Tooltip
                        placement="top"
                        target={toggleId}
                        trigger={['hover']}
                    >
                        There are already 4 active flows. Disable one of them to
                        activate.
                    </Tooltip>
                )}
            </td>

            <td className={css.title} onClick={onEditClick}>
                {title}
            </td>

            <td>
                <div className={css.actionButtonsWrapper}>
                    <button className={css.actionButton} onClick={onEditClick}>
                        <div className="material-icons chevron_right">
                            chevron_right
                        </div>
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default QuickResponseListItem
