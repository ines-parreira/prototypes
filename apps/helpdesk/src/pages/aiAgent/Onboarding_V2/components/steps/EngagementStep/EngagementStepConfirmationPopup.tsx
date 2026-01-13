import { useParams } from 'react-router-dom'

import { Box, Button, Modal, OverlayHeader, Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV } from 'pages/aiAgent/components/CustomerEngagementSettings/ConversationLauncherSettings'
import { CONV_STARTERS_ESTIMATED_INFLUENCED_GMV } from 'pages/aiAgent/components/CustomerEngagementSettings/ConversationStartersSettings'
import { useGmvUsdOver30Days } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days'
import { useLowestPotentialImpact } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useLowestPotentialImpact'
import { TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV } from 'pages/aiAgent/components/CustomerEngagementSettings/TriggerOnSearchSettings'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

import css from './EngagementStepConfirmationPopup.less'

type Props = {
    isOpen: boolean
    onTurnOff: () => void
    onKeepOn: () => void
    onClose: () => void
}

export const EngagementStepConfirmationPopup = ({
    isOpen,
    onTurnOff,
    onKeepOn,
    onClose,
}: Props) => {
    const { shopName } = useParams<{ shopName: string }>()

    const storeIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    const { data: gmv, isLoading: isGmvLoading } = useGmvUsdOver30Days(
        storeIntegration.id,
    )

    const lowestPotentialImpact = useLowestPotentialImpact([
        {
            gmv,
            estimatedInfluencedGMV: CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV,
        },
        {
            gmv,
            estimatedInfluencedGMV: CONV_STARTERS_ESTIMATED_INFLUENCED_GMV,
        },
        {
            gmv,
            estimatedInfluencedGMV: TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV,
        },
    ])

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
            <Box flexDirection="column">
                <OverlayHeader title="Keep Customer Engagement on to boost sales" />
                <Box flexDirection="column" gap="md">
                    <div className={css.content}>
                        <Text>
                            Customer engagement features help your Shopping
                            Assistant connect with visitors and drive more
                            conversions—{lowestPotentialImpact}
                        </Text>
                        <Text>
                            Keep them on to make the most of every store visit.
                        </Text>
                    </div>
                </Box>
                <Box
                    justifyContent="flex-end"
                    gap="sm"
                    marginTop="md"
                    className={css.footer}
                >
                    <Button
                        variant="secondary"
                        onClick={onTurnOff}
                        className={css.button}
                        isDisabled={isGmvLoading}
                    >
                        Turn Off
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onKeepOn}
                        className={css.button}
                        isDisabled={isGmvLoading}
                    >
                        Keep Engagement Features On
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
