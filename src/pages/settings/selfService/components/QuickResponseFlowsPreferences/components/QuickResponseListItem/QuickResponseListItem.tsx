import React, {useState, useEffect, useMemo} from 'react'
import classNames from 'classnames'

import ToggleInput from 'pages/common/forms/ToggleInput'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Tooltip from 'pages/common/components/Tooltip'

import {isProduction} from 'utils/environment'
import css from './QuickResponseListItem.less'

interface QuickResponseListItemProps {
    title: string
    enabled: boolean
    isLimitReached: boolean
    position: number
    onEditClick: () => void
    onDeleteConfirmation: () => void
    onToggle: () => void
}

const QuickResponseListItem: React.FC<QuickResponseListItemProps> = ({
    title,
    enabled,
    isLimitReached,
    onEditClick,
    onDeleteConfirmation,
    onToggle,
}) => {
    const [isLoading, setIsLoading] = useState(false)
    const isDisabled = !enabled && isLimitReached

    const toggleId = useMemo(() => {
        return title.replace(/\W/g, '_')
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

            <td>{title}</td>

            <td>
                <div className={css.actionButtonsWrapper}>
                    {isProduction() ? (
                        <>
                            <button
                                className={css.actionButton}
                                onClick={onEditClick}
                            >
                                <div className="material-icons edit">edit</div>
                            </button>
                            <ConfirmButton
                                id={`confirm_button_${toggleId}`}
                                confirmationContent={
                                    <span>
                                        Are you sure you want to delete this
                                        quick response flow?
                                    </span>
                                }
                                fillStyle="ghost"
                                onConfirm={onDeleteConfirmation}
                                placement="top"
                                confirmationButtonIntent="destructive"
                                intent="destructive"
                                className={css.actionButton}
                            >
                                <div className="material-icons delete">
                                    delete
                                </div>
                            </ConfirmButton>
                        </>
                    ) : (
                        <button
                            className={css.actionButton}
                            onClick={onEditClick}
                        >
                            <div className="material-icons chevron_right">
                                chevron_right
                            </div>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    )
}

export default QuickResponseListItem
