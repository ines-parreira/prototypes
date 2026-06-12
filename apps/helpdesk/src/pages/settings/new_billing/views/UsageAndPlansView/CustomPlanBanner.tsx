import type { MouseEvent } from 'react'

import { Link } from 'react-router-dom'

import { Banner, Box, Button, Text } from '@gorgias/axiom'

const MASTER_SUBSCRIPTION_AGREEMENT_URL =
    'https://www.gorgias.com/legal/master-subscription-agreement'

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
                <Link to="#" onClick={handleClick}>
                    <Text variant="bold">Contact us</Text>
                </Link>
            </Banner>
        </Box>
    )
}

export const GatedCancellationBanner = ({
    contactUsCallback,
}: {
    contactUsCallback: () => void
}) => {
    return (
        <Box mb="xl" width="100%">
            <Banner
                intent="info"
                icon="info"
                variant="fullWidth"
                isClosable={false}
                description={
                    <Text size="md">
                        Your account is on a managed plan. To cancel products on
                        your account, please contact us. Changes take effect per
                        your{' '}
                        <a
                            href={MASTER_SUBSCRIPTION_AGREEMENT_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            subscription term
                        </a>
                        .
                    </Text>
                }
            >
                <Button size="sm" onClick={contactUsCallback}>
                    Contact us
                </Button>
            </Banner>
        </Box>
    )
}
