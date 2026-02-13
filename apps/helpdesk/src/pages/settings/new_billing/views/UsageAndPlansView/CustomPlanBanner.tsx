import type { MouseEvent } from 'react'

import { Link } from 'react-router-dom'

import { Banner, Box, Text } from '@gorgias/axiom'

export const CustomPlanBanner = ({
    contactUsCallback,
}: {
    contactUsCallback: () => void
}) => {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        contactUsCallback()
    }

    return (
        <Box marginBottom="md" width="100%" mb="xl">
            <Banner
                title="Because you’re on a custom plan, please contact our team to make changes to your subscription."
                variant="fullWidth"
                isClosable={true}
                intent="info"
                icon="info"
            >
                <Link to="#">
                    <Text variant="bold" onClick={handleClick}>
                        Contact us
                    </Text>
                </Link>
            </Banner>
        </Box>
    )
}
