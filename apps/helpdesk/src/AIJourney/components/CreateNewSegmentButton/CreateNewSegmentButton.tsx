import { Box, Icon, Size, Text, TextVariant } from '@gorgias/axiom'

import css from './CreateNewSegmentButton.less'

export const CreateNewSegmentButton = ({
    onClick,
}: {
    onClick: () => void
}) => {
    return (
        <button onClick={onClick} className={css.titleButton}>
            <Box padding={Size.Xxs} gap={Size.Xxxs}>
                <Icon name="add-plus" />
                <Text variant={TextVariant.Bold}>Create new segment</Text>
            </Box>
        </button>
    )
}
