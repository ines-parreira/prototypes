import { Box, Loader, Text } from '@gorgias/axiom'

import css from './ChatPreviewLoading.less'

export const ChatPreviewLoading = () => {
    return (
        <Box
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap="sm"
            className={css.overlay}
        >
            <Loader aria-label="Loading preview" />
            <Text>Loading preview...</Text>
        </Box>
    )
}
