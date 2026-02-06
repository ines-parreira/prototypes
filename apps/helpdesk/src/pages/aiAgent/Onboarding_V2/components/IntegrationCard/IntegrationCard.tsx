import type { ReactNode } from 'react'
import type React from 'react'

import { Box, Button, Heading, Text } from '@gorgias/axiom'

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from 'pages/aiAgent/Onboarding_V2/components/Card'

type IntegrationCardProps = {
    buttonLabel?: string
    description?: string
    icon?: ReactNode
    onClick?: React.MouseEventHandler
    status?: ReactNode
    title: string
    children?: ReactNode
}

export const IntegrationCard = ({
    buttonLabel,
    description,
    icon,
    onClick,
    status,
    title,
    children,
}: IntegrationCardProps) => {
    return (
        <Card>
            <CardHeader>
                <Box justifyContent="space-between">
                    {icon}
                    {status && <Text>{status}</Text>}
                </Box>
            </CardHeader>

            <CardContent>
                <Box justifyContent="center" flexDirection="column">
                    <Heading size="md">{title}</Heading>
                    <Box>
                        <Text>{description}</Text>
                    </Box>
                    <div>{children}</div>
                </Box>
            </CardContent>

            {buttonLabel && onClick && (
                <CardFooter>
                    <Button
                        variant="primary"
                        trailingSlot="external-link"
                        onClick={onClick}
                    >
                        {buttonLabel}
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
