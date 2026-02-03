import { Box, Heading, Text } from '@gorgias/axiom'

type StepHeaderProps = {
    title: string
    subtitle?: React.ReactNode | string
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
    const isSubtitleString = typeof subtitle === 'string'

    return (
        <>
            <Heading size="xxl">{title}</Heading>
            {subtitle && (
                <Box marginTop="md" marginBottom="lg">
                    {isSubtitleString ? <Text>{subtitle}</Text> : subtitle}
                </Box>
            )}
        </>
    )
}
