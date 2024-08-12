import React, {useCallback, useMemo, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {fromJS, Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {getHumanAgentsJS} from 'state/agents/selectors'
import {
    getIntegrationById,
    getIntegrationByIdAndType,
} from 'state/integrations/selectors'
import history from 'pages/history'

import {
    CONVERT_ROUTE_CAMPAIGN_PARAM_NAME,
    CONVERT_ROUTE_PARAM_NAME,
    CONVERT_ROUTING_AB_VARIANT_PARAM_NAME,
} from 'pages/convert/common/constants'
import {ConvertRouteAbVariantParams} from 'pages/convert/common/types'

import {VARIANT_LIMIT} from 'pages/convert/abVariants/contants'
import {abVariantsUrl} from 'pages/convert/abVariants/urls'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {Label} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {
    CampaignDetailsForm,
    Props as CampaignDetailsFormProps,
} from 'pages/convert/campaigns/providers/CampaignDetailsForm'

import {chatIsShopifyStore} from 'pages/convert/campaigns/utils/chatIsShopifyStore'

type Props = {
    isControlVersion: boolean
    campaign: Campaign
    onDiscard?: () => void
    addVariant?: () => void
    onUpdate?: (campaign: Map<any, any>, variantId?: string | null) => void
    onCreate?: (campaign: Map<any, any>) => void
    onDuplicateVariant?: (variantId: string | null) => void
}

export const ABTestVariantEditPage: React.FC<Props> = (props) => {
    const {
        isControlVersion,
        campaign: data,
        onDiscard,
        addVariant,
        onUpdate,
        onCreate,
        onDuplicateVariant,
    } = props

    const {
        [CONVERT_ROUTE_PARAM_NAME]: integrationId,
        [CONVERT_ROUTE_CAMPAIGN_PARAM_NAME]: campaignId,
        [CONVERT_ROUTING_AB_VARIANT_PARAM_NAME]: variantId,
    } = useParams<ConvertRouteAbVariantParams>()

    const integration = useAppSelector(
        getIntegrationById(parseInt(integrationId))
    )

    const shopifyIntegration = useAppSelector(
        getIntegrationByIdAndType(
            integration.getIn(['meta', 'shop_integration_id']),
            IntegrationType.Shopify
        )
    )

    const shopify = fromJS(shopifyIntegration || {})

    const agents = useAppSelector(getHumanAgentsJS)

    const handleDiscardVariant = () => {
        onDiscard && onDiscard()
        history.push(abVariantsUrl(integrationId, campaignId))
    }

    const handleUpdateCampaign = useCallback(
        async (campaign: Map<any, any>) => {
            // eslint-disable-next-line @typescript-eslint/await-thenable
            onUpdate && (await onUpdate(campaign))
        },
        [onUpdate]
    )

    const handleUpdateVariant = async (campaign: Map<any, any>) => {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        onUpdate && (await onUpdate(campaign, variantId))
    }

    const handleCreateVariant = async (campaign: Map<any, any>) => {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        onCreate && (await onCreate(campaign))
    }

    const handleDuplicateVariant = async () => {
        if (variantId === undefined) {
            return
        }
        // eslint-disable-next-line @typescript-eslint/await-thenable
        onDuplicateVariant && (await onDuplicateVariant(variantId))
    }

    const backUrl = `/app/convert/${integrationId}/campaigns`

    const isDuplicateDisabled = useMemo(() => {
        return (data.variants ?? []).length >= VARIANT_LIMIT
    }, [data])

    const campaignVariant = useMemo(() => {
        let newData = {...data}
        if (newData && !isControlVersion && variantId === undefined) {
            // if creating a new variant clean data
            newData = {
                ...newData,
                message_text: '',
                message_html: '',
                attachments: [],
            }
        } else if (newData) {
            const variant = (data?.variants || []).find(
                (item) => item.id === variantId
            )
            if (variant) {
                newData.message_html = variant.message_html
                newData.message_text = variant.message_text
                newData.attachments = variant?.attachments
                    ? variant.attachments
                    : undefined
            }
        }
        return newData
    }, [data, variantId, isControlVersion])

    const wizardConfiguration = useMemo(() => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Basics]: {
                    isDisabled: true,
                },
                [CampaignStepsKeys.Audience]: {
                    isDisabled: true,
                },
            },
            labels: {
                [Label.Update]: 'Update Variant',
                [Label.Duplicate]: 'Duplicate Variant',
            },
        }
    }, [])

    useEffect(() => {
        if (!addVariant) {
            return
        }

        addVariant()

        return () => {
            if (onDiscard) {
                onDiscard()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addVariant, onDiscard])

    let campaignDetailsFormProps: CampaignDetailsFormProps = {
        agents: agents,
        campaign: data,
        isLoading: false,
        isEditMode: true,
        isShopifyStore: chatIsShopifyStore(integration),
        isOverCampaignsLimit: false,
        isCreateDisabled: true,
        integration: integration,
        shopifyIntegration: shopify,
        updateCampaign: handleUpdateCampaign,
        backUrl: backUrl,
        openedStep: CampaignStepsKeys.Message,
    }

    if (!isControlVersion) {
        campaignDetailsFormProps = {
            ...campaignDetailsFormProps,
            campaign: campaignVariant as Campaign,
            isEditMode: variantId !== undefined,
            isCreateDisabled: false,
            updateCampaign: handleUpdateVariant,
            createCampaign: handleCreateVariant,
            duplicateCampaign:
                variantId !== undefined && !isDuplicateDisabled
                    ? handleDuplicateVariant
                    : undefined,
            onDiscard: handleDiscardVariant,
            wizardConfiguration: wizardConfiguration,
            allowActivate: false,
        }
    }

    return <CampaignDetailsForm {...campaignDetailsFormProps} />
}

export default ABTestVariantEditPage
