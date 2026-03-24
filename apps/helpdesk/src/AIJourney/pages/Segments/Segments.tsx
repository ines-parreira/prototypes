import { Box, Heading, Size } from '@gorgias/axiom'

export const Segments = () => {
    return (
        <Box m={Size.Lg} flexDirection="column">
            <Box
                alignItems="center"
                justifyContent="space-between"
                marginBottom={Size.Xl}
            >
                <Heading size="xl">Segments</Heading>
            </Box>
        </Box>
    )
}
