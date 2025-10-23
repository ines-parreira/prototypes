import React, { useCallback, useMemo, useState } from 'react'

import { history } from '@repo/routing'

import { Badge, LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { CampaignCreatePayload } from 'models/convert/campaign/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import RadioButton from 'pages/common/components/RadioButton'
import { generateVariantName } from 'pages/convert/abVariants/utils/generateVariantName'
import { useCreateCampaign } from 'pages/convert/campaigns/hooks/useCreateCampaign'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { CampaignVariant } from 'pages/convert/campaigns/types/CampaignVariant'
import { createCampaignFromVariant } from 'pages/convert/campaigns/utils/createCampaignFromVariant'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { getIntegrationById } from 'state/integrations/selectors'
import { toJS } from 'utils'

import css from './CampaignFromABTestModal.less'

type Props = {
    isOpen: boolean
    campaign: Campaign
    integrationId: number
    onClose: () => void
}

export type VariantEntry = {
    variant?: CampaignVariant
    isWinner: boolean
    variantId: string
    variantName: string
}

const CampaignFromABTestModal: React.FC<Props> = (props) => {
    const { isOpen, campaign, integrationId, onClose } = props

    const [selectedVariant, setSelectedVariant] = useState(campaign.id)

    const integration = useAppSelector(getIntegrationById(integrationId))
    const { channelConnection } = useGetOrCreateChannelConnection(
        toJS(integration),
    )

    const { mutateAsync: createCampaign, isLoading } = useCreateCampaign()

    const onVariantClick = (value: any) => {
        setSelectedVariant(value)
    }

    const variants: VariantEntry[] = useMemo(
        () => [
            {
                variantId: campaign.id,
                variantName: 'Control Variant',
                isWinner: campaign.ab_group?.winner_variant_id === null,
            },
            ...(campaign.variants || []).map((variant, idx) => ({
                variant: variant,
                variantId: variant.id,
                variantName: generateVariantName(idx),
                isWinner: campaign.ab_group?.winner_variant_id === variant.id,
            })),
        ],
        [campaign],
    )

    const handleCreateCampaign = useCallback(async () => {
        if (!!channelConnection) {
            const selectedVariantEntry = variants.find(
                (variant) => variant.variantId === selectedVariant,
            )
            const campaignData = createCampaignFromVariant(
                campaign,
                channelConnection.id,
                selectedVariantEntry?.variant,
            ) as CampaignCreatePayload
            const response = await createCampaign([undefined, campaignData])
            const newCampaign = response?.data as Campaign

            history.push(
                `/app/convert/${integrationId}/campaigns/${newCampaign?.id}`,
            )
        }
    }, [
        channelConnection,
        variants,
        campaign,
        createCampaign,
        integrationId,
        selectedVariant,
    ])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Create new campaign" />
            <ModalBody>
                <div>
                    <p className={css.description}>
                        Please choose the Variant you would like to base your
                        new campaign on.
                    </p>
                    <div>
                        <h3>Please choose a variant</h3>
                        <div>
                            {variants.map((variant, idx) => {
                                return (
                                    <RadioButton
                                        key={idx}
                                        className={css.radioButton}
                                        onClick={() =>
                                            onVariantClick(variant.variantId)
                                        }
                                        label={
                                            <>
                                                {variant.variantName}{' '}
                                                {variant.isWinner && (
                                                    <div className="ml-2">
                                                        <Badge type={'blue'}>
                                                            Winner
                                                        </Badge>
                                                    </div>
                                                )}
                                            </>
                                        }
                                        isSelected={
                                            variant.variantId ===
                                            selectedVariant
                                        }
                                        value={variant.variantId}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    isLoading={isLoading}
                    isDisabled={!selectedVariant}
                    onClick={handleCreateCampaign}
                >
                    Create Campaign
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default CampaignFromABTestModal
