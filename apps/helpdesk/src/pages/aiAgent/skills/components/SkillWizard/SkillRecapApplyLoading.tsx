import { Box, Text } from '@gorgias/axiom'

type Props = {
    message: string
}

export const SkillRecapApplyLoading = ({ message }: Props) => (
    <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="sm"
        height="100%"
        role="status"
        aria-live="polite"
        aria-label={message}
    >
        <Box w={115} h={115} style={{ backgroundColor: '#d9d9d9' }} />
        <Text>{message}</Text>
    </Box>
)
