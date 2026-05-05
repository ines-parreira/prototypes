import type { EditFieldsType } from '@repo/navigation'

import { Box, Button, Icon, Text } from '@gorgias/axiom'

import { getInfobarEditModeHeaderTitle } from './getInfobarEditModeHeaderTitle'

import css from './InfobarEditModeHeader.module.less'

type Props = {
    editingWidgetType: EditFieldsType
    onClose: () => void
}

export function InfobarEditModeHeader({ editingWidgetType, onClose }: Props) {
    const title = getInfobarEditModeHeaderTitle(editingWidgetType)

    return (
        <Box
            className={css.header}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="xs"
            paddingTop="sm"
            paddingBottom="sm"
            paddingLeft="md"
            paddingRight="md"
        >
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                flex={1}
                minWidth={0}
            >
                <Icon name="edit-pencil" size="sm" />
                <Text size="md" variant="bold" overflow="ellipsis">
                    {title}
                </Text>
            </Box>
            <Button
                variant="tertiary"
                size="sm"
                icon="close"
                aria-label="Exit edit mode"
                onClick={onClose}
            />
        </Box>
    )
}
