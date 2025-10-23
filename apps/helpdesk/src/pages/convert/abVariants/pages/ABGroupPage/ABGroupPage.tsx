import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { history } from '@repo/routing'
import { produce } from 'immer'
import { Map } from 'immutable'
import { Route, Switch, useParams } from 'react-router-dom'
import { Container } from 'reactstrap'

import { Skeleton } from '@gorgias/axiom'

import { useGetCampaign } from 'models/convert/campaign/queries'
import { CampaignUpdatePayload } from 'models/convert/campaign/types'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import { ABGroupContainer } from 'pages/convert/abVariants/containers/ABGroupContainer'
import ABTestSettingsPage from 'pages/convert/abVariants/pages/ABTestSettingsPage'
import ABTestVariantEditPage from 'pages/convert/abVariants/pages/ABTestVariantEditPage'
import {
    abVariantAddPath,
    abVariantEditorPath,
    abVariantEditorUrl,
    abVariantsControlVersionPath,
    abVariantsPath,
} from 'pages/convert/abVariants/urls'
import { createVariant } from 'pages/convert/abVariants/utils/createVariant'
import { deleteVariant } from 'pages/convert/abVariants/utils/deleteVariant'
import { duplicateVariant } from 'pages/convert/abVariants/utils/duplicateVariant'
import { updateVariant } from 'pages/convert/abVariants/utils/updateVariant'
import { useUpdateCampaign } from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { CampaignVariant } from 'pages/convert/campaigns/types/CampaignVariant'
import { ABGroupStatus } from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import {
    CONVERT_ROUTE_CAMPAIGN_PARAM_NAME,
    CONVERT_ROUTE_PARAM_NAME,
} from 'pages/convert/common/constants'
import { ConvertRouteAbVariantParams } from 'pages/convert/common/types'
import { toJS } from 'utils'

import css from './ABGroupPage.less'

type ABGRoupViewProps = {
    campaign: Campaign
    integrationId: string
}

export const ABGroupView: React.FC<ABGRoupViewProps> = ({
    campaign,
    integrationId,
}) => {
    const [campaignData, setCampaignData] = useState<Campaign>({ ...campaign })

    useEffect(() => {
        setCampaignData({ ...campaign })
    }, [campaign])

    const { mutateAsync: updateCampaignRequest } = useUpdateCampaign()

    const updateCampaign = useCallback(
        async (payload: CampaignUpdatePayload) => {
            await updateCampaignRequest([
                undefined,
                {
                    campaign_id: campaignData.id,
                },
                payload,
            ])
        },
        [campaignData, updateCampaignRequest],
    )

    const canPerformCreateDeleteActions = useMemo(() => {
        if (!campaignData.ab_group) {
            return false
        }

        return campaignData.ab_group.status === ABGroupStatus.Draft
    }, [campaignData])

    const canPerformUpdateActions = useMemo(() => {
        const statuses: string[] = [
            ABGroupStatus.Started,
            ABGroupStatus.Completed,
        ]

        if (!campaignData.ab_group) {
            return false
        }

        return !(statuses.indexOf(campaignData.ab_group?.status as string) >= 0)
    }, [campaignData])

    const addVariant = () => {
        const hasEmptyVariant = campaignData.variants?.find(
            (variant) => !variant.id,
        )
        if (hasEmptyVariant) {
            // user clicked `Add Variant` but didn't save data.
            return
        }

        setCampaignData(
            produce((draft) => {
                const emptyVariant = {
                    message_text: '',
                    message_html: '',
                    attachments: null,
                } as CampaignVariant

                draft.variants = [...(draft.variants || []), emptyVariant]
            }),
        )
    }

    const handleDiscardVariant = () => {
        const emptyVariantIdx = campaignData.variants?.findIndex(
            (variant) => !variant.id,
        )
        if (emptyVariantIdx === undefined || emptyVariantIdx < 0) {
            return
        }

        setCampaignData(
            produce((draft) => {
                if (draft.variants) {
                    draft.variants.splice(emptyVariantIdx, 1)
                }
            }),
        )
    }

    const handleUpdateControlVariant = async (data: Map<any, any>) => {
        const campaignData: Campaign = toJS(data)
        await updateCampaign(campaignData as CampaignUpdatePayload)
    }

    const handleUpdateVariant = async (
        campaign: Map<any, any>,
        variantId?: string | null,
    ) => {
        const variants = updateVariant(
            campaignData.variants ?? [],
            toJS(campaign),
            variantId as string,
        )

        if (!variants) {
            return
        }

        // Update state to not have glitches
        setCampaignData(
            produce((draft) => {
                draft.variants = variants
            }),
        )

        await updateCampaign({ variants: variants } as CampaignUpdatePayload)
    }

    const handleDuplicateVariant = async (variantId: string | null) => {
        const [newVariantId, variants] = duplicateVariant(
            campaignData?.variants ?? [],
            campaignData,
            variantId,
        )

        if (!newVariantId) {
            return
        }

        // Update state to not have glitches
        setCampaignData(
            produce((draft) => {
                draft.variants = variants
            }),
        )

        await updateCampaign({ variants: variants } as CampaignUpdatePayload)

        history.push(
            abVariantEditorUrl(integrationId, campaignData.id, newVariantId),
        )
    }

    const handleDeleteVariant = async (variantId: string | null) => {
        const variants = deleteVariant(
            campaignData.variants ?? [],
            variantId as string,
        )

        if (!variants) {
            return
        }

        // Update state to not have glitches
        setCampaignData(
            produce((draft) => {
                draft.variants = variants
            }),
        )

        await updateCampaign({ variants: variants } as CampaignUpdatePayload)
    }

    const handleCreateVariant = async (data: Map<any, any>) => {
        const [newVariantId, variants] = createVariant(
            campaignData?.variants ?? [],
            toJS(data),
        )

        if (!newVariantId) {
            return
        }

        // Update state to not have glitches
        setCampaignData(
            produce((draft) => {
                draft.variants = variants
            }),
        )

        await updateCampaign({ variants: variants } as CampaignUpdatePayload)

        history.push(
            abVariantEditorUrl(integrationId, campaignData.id, newVariantId),
        )
    }

    return (
        <ABGroupContainer campaign={campaignData}>
            <Container fluid className={css.pageContainer}>
                <Switch>
                    <Route exact path={abVariantsPath}>
                        <ABTestSettingsPage
                            canCreateDeleteObjects={
                                canPerformCreateDeleteActions
                            }
                            campaign={campaignData}
                            integrationId={integrationId as unknown as number}
                            onDelete={handleDeleteVariant}
                            onDuplicate={handleDuplicateVariant}
                        />
                    </Route>
                    <Route exact path={abVariantsControlVersionPath}>
                        <ABTestVariantEditPage
                            canCreateDeleteObjects={
                                canPerformCreateDeleteActions
                            }
                            canModifyObjects={canPerformUpdateActions}
                            isControlVersion={true}
                            campaign={campaignData}
                            onUpdate={handleUpdateControlVariant}
                            onDuplicateVariant={handleDuplicateVariant}
                        />
                    </Route>
                    <Route exact path={abVariantAddPath}>
                        <ABTestVariantEditPage
                            canCreateDeleteObjects={
                                canPerformCreateDeleteActions
                            }
                            canModifyObjects={canPerformUpdateActions}
                            isControlVersion={false}
                            campaign={campaignData}
                            addVariant={addVariant}
                            onDiscard={handleDiscardVariant}
                            onCreate={handleCreateVariant}
                        />
                    </Route>
                    <Route exact path={abVariantEditorPath}>
                        <ABTestVariantEditPage
                            canCreateDeleteObjects={
                                canPerformCreateDeleteActions
                            }
                            canModifyObjects={canPerformUpdateActions}
                            isControlVersion={false}
                            campaign={campaignData}
                            onUpdate={handleUpdateVariant}
                            onDuplicateVariant={handleDuplicateVariant}
                        />
                    </Route>
                </Switch>
            </Container>
        </ABGroupContainer>
    )
}

const ABGroupPage = () => {
    const {
        [CONVERT_ROUTE_PARAM_NAME]: integrationId,
        [CONVERT_ROUTE_CAMPAIGN_PARAM_NAME]: campaignId,
    } = useParams<ConvertRouteAbVariantParams>()

    const { data, isLoading } = useGetCampaign(
        { campaign_id: campaignId || '' },
        { enabled: !!campaignId },
    )

    if (isLoading || !data) {
        return (
            <Container fluid className={css.pageSkeletonContainer}>
                <div className={css.mainLoader}>
                    <Skeleton height={75} width={'100%'} />
                </div>

                <div className={css.mainLoader}>
                    <Skeleton height={75} width={'100%'} />
                </div>

                <div className={css.tableLoader}>
                    <Skeleton height={50} width={'100%'} />
                </div>
                <div>
                    <SkeletonLoader className={css.loader} length={3} />
                </div>
            </Container>
        )
    }

    return (
        <ABGroupView
            campaign={data as Campaign}
            integrationId={integrationId}
        />
    )
}

export default ABGroupPage
