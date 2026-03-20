import classnames from 'classnames'
import { useHistory } from 'react-router-dom'

import { Box, Button, Text } from '@gorgias/axiom'

import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import type { FlowItemProps } from './types'

import css from './FlowItem.less'

export const FlowItem = ({
    index,
    label,
    channelType,
    editUrl,
    onMove,
    onDrop,
    onCancel,
    onDelete,
}: FlowItemProps) => {
    const history = useHistory()
    const type = `flows-revamp-${channelType}`
    const { dragRef, dropRef, isDragging } = useReorderDnD(
        { type, position: index },
        [type],
        { onHover: onMove, onDrop, onCancel },
    )

    return (
        <div
            ref={dropRef as React.Ref<HTMLDivElement>}
            style={{ opacity: isDragging ? 0 : 1 }}
            className={css.flowItem}
        >
            <Box alignItems="center" gap="md" flex={1}>
                <i
                    ref={dragRef as React.Ref<HTMLElement>}
                    className={classnames('material-icons', css.dragHandle)}
                    aria-label="Drag to reorder"
                >
                    drag_indicator
                </i>
                <Text size="md">{label}</Text>
            </Box>
            <Box alignItems="center" gap="lg">
                <Button
                    variant="tertiary"
                    size="sm"
                    icon="edit-pencil"
                    aria-label={`Edit ${label}`}
                    onClick={() => history.push(editUrl)}
                />
                <Button
                    variant="tertiary"
                    size="sm"
                    icon="close"
                    aria-label={`Remove ${label}`}
                    onClick={onDelete}
                />
            </Box>
        </div>
    )
}
