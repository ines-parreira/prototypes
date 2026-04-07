import { Box, Heading, Skeleton } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type {
    ResponseMessageContent,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'

import { CancelOrderEligibility } from './CancelOrderEligibility'
import { CancelOrderResponseMessage } from './CancelOrderResponseMessage'

import css from './CancelOrderConfiguration.less'

type Props = {
    shopName: string
    isLoading: boolean
    eligibility?: SelfServiceConfigurationFilter
    responseMessageContent: ResponseMessageContent
    onEligibilityChange: (value: string[] | undefined) => void
    onResponseMessageChange: (
        responseMessageContent: ResponseMessageContent,
    ) => void
}

export const CancelOrderConfiguration = ({
    shopName,
    isLoading,
    eligibility,
    responseMessageContent,
    onEligibilityChange,
    onResponseMessageChange,
}: Props) => {
    const { hasAccess } = useAiAgentAccess(shopName)

    if (isLoading) {
        return (
            <Box flexDirection="column" gap="md" className={css.container}>
                <Skeleton height={24} width={400} />
                <Box flexDirection="column" gap="xs">
                    <Skeleton height={20} width={120} />
                    <Skeleton height={16} width={300} />
                    <Skeleton height={32} width={320} />
                </Box>
                <Box flexDirection="column" gap="xxs">
                    <Skeleton height={20} width={200} />
                    <Skeleton height={52} />
                    <Skeleton height={16} width={500} />
                </Box>
            </Box>
        )
    }

    return (
        <Box flexDirection="column" gap="md" className={css.container}>
            <Heading size="sm">
                Allow customers to request a cancellation if an order
                hasn&apos;t been processed or shipped.
            </Heading>
            <CancelOrderEligibility
                eligibility={eligibility}
                onChange={onEligibilityChange}
            />
            {hasAccess && (
                <CancelOrderResponseMessage
                    responseMessageContent={responseMessageContent}
                    onChange={onResponseMessageChange}
                />
            )}
        </Box>
    )
}
