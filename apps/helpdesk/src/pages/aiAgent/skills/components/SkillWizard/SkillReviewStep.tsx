import { Box } from '@gorgias/axiom'

type Props = {
    recommendation: string
    index: number
}

export const SkillReviewStep = ({ recommendation, index }: Props) => {
    return (
        <Box padding="lg">
            Step {index + 1}: {recommendation}
        </Box>
    )
}
