import { Box, Button, Text } from '@gorgias/axiom'

import { ChatPreviewErrorIllustration } from './ChatPreviewErrorIllustration'

type Props = {
    onReload?: () => void
}

export const ChatPreviewErrorState = ({ onReload }: Props) => {
    return (
        <Box
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap="lg"
            height="100%"
            width="100%"
        >
            <ChatPreviewErrorIllustration />
            <Text>{"Couldn't load preview."}</Text>
            {onReload && (
                <Button variant="secondary" onClick={onReload}>
                    Reload preview
                </Button>
            )}
        </Box>
    )
}
