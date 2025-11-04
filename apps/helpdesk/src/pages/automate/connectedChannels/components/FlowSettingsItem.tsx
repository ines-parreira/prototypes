import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { LegacyLabel as Label, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import css from './FlowSettingsItem.less'

interface Props {
    label: string
    triggerName: string | undefined
    id: string
    url: string
    index: number
    channelType: string
    onDelete: () => void
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    languagesMismatchWarning?: React.ReactNode
}

export const FlowSettingsItem = ({
    label,
    triggerName,
    url,
    index,
    channelType,
    languagesMismatchWarning,
    id,
    onMove,
    onDrop,
    onDelete,
    onCancel,
}: Props) => {
    const type = `flows-${channelType}`
    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD(
        { type, position: index },
        [type],
        { onHover: onMove, onDrop, onCancel },
    )

    return (
        <div
            data-handler-id={handlerId}
            ref={dropRef as any}
            style={{ opacity: isDragging ? 0 : 1 }}
            className={css.container}
        >
            <li key={id} className={css.workflowListItem}>
                <i
                    className={classNames('material-icons', css.dragIcon)}
                    ref={dragRef as any}
                >
                    drag_indicator
                </i>

                <div data-handler-id={handlerId}>
                    <div className={css.workflowListItemContent}>
                        <Label>{label}</Label>

                        {languagesMismatchWarning && (
                            <>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.warningIcon,
                                    )}
                                    id="languages-mismatch-warning"
                                >
                                    warning
                                </i>
                                <Tooltip
                                    autohide={false}
                                    trigger={['hover']}
                                    placement="top"
                                    target="languages-mismatch-warning"
                                >
                                    {languagesMismatchWarning}
                                </Tooltip>
                            </>
                        )}
                    </div>

                    <span className={css.workflowTriggerName}>
                        {triggerName}
                    </span>
                </div>
                <div className={css.workflowListItemButtons}>
                    <Link to={url}>
                        <IconButton fillStyle="ghost" intent="secondary">
                            edit
                        </IconButton>
                    </Link>
                    <IconButton
                        fillStyle="ghost"
                        intent="destructive"
                        onClick={() => onDelete?.()}
                    >
                        close
                    </IconButton>
                </div>
            </li>
        </div>
    )
}
