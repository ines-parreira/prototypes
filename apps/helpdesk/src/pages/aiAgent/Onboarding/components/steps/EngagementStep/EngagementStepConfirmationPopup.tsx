import { useParams } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV } from 'pages/aiAgent/components/CustomerEngagementSettings/ConversationLauncherSettings'
import { CONV_STARTERS_ESTIMATED_INFLUENCED_GMV } from 'pages/aiAgent/components/CustomerEngagementSettings/ConversationStartersSettings'
import { useGmvUsdOver30Days } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days'
import { useLowestPotentialImpact } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useLowestPotentialImpact'
import { TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV } from 'pages/aiAgent/components/CustomerEngagementSettings/TriggerOnSearchSettings'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="medium"
            isClosable={false}
            preventCloseClickOutside
        >
            <ModalHeader
                title="Keep Customer Engagement on to boost sales"
                className={css.header}
            />
            <ModalBody>
                <div className={css.content}>
                    <div>
                        Customer engagement features help your Shopping
                        Assistant connect with visitors and drive more
                        conversions—{lowestPotentialImpact}
                    </div>
                    <div>
                        Keep them on to make the most of every store visit.
                    </div>
                </div>
            </ModalBody>
            <ModalActionsFooter className={css.footer}>
                <Button
                    intent="secondary"
                    onClick={onTurnOff}
                    className={css.button}
                    isDisabled={isGmvLoading}
                >
                    Turn Off
                </Button>
                <Button
                    onClick={onKeepOn}
                    className={css.button}
                    isDisabled={isGmvLoading}
                >
                    Keep Engagement Features On
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
