import type React from 'react'
import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useModalManager } from 'hooks/useModalManager'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import CampaignFromABTestModal from 'pages/convert/abVariants/components/CampaignFromABTestModal'
import VariantsList from 'pages/convert/abVariants/components/VariantsList'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { ABGroupStatus } from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import { isActiveStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import { HeaderReturnButton } from 'pages/convert/common/components/HeaderReturnButton'

import css from './ABTestSettingsPage.less'

type Props = {
    campaign: Campaign
    integrationId: number
    canCreateDeleteObjects: boolean
    onDelete: (variantId: string | null) => void
    onDuplicate: (variantId: string | null) => void
}

export const ABTestSettingsPage: React.FC<Props> = ({
    canCreateDeleteObjects,
    campaign,
    integrationId,
    onDelete,
    onDuplicate,
}) => {
    const shouldDisplayBanner = useMemo(() => {
        return (
            isActiveStatus(campaign.status) &&
            ([ABGroupStatus.Draft, ABGroupStatus.Paused] as string[]).indexOf(
                campaign.ab_group?.status ?? '',
            ) >= 0
        )
    }, [campaign])

    const createCampaignManager = useModalManager('createCampaignFromWinner')

    return (
        <>
            <div className={css.pageContentWithPadding}>
                <div className={css.subHeader}>
                    <HeaderReturnButton
                        backToHref={`/app/convert/${integrationId}/campaigns`}
                        title="Back to Campaigns list"
                        className={css.backWrapper}
                    />
                    <div className={css.pushToRight}>
                        <a
                            href="https://link.gorgias.com/a99"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={css.externalLink}
                        >
                            <i className="material-icons">menu_book</i> Learn
                            about A/B Testing
                        </a>
                    </div>
                </div>

                {shouldDisplayBanner && (
                    <div className={css.alertWrapper}>
                        <Alert icon type={AlertType.Info}>
                            Your campaign is still running as your “Control
                            Variant”. Once the A/B test is started, traffic will
                            be evenly distributed across your variants.
                        </Alert>
                    </div>
                )}

                <div className={css.variantWrapper}>
                    <h2>Variants</h2>
                    <p>
                        View and manage your variants here. Access the full
                        performance data on the{' '}
                        <Link to={`/app/convert/${integrationId}/performance`}>
                            <strong>performance dashboard</strong>
                        </Link>
                        .
                    </p>
                </div>
            </div>

            <div>
                <VariantsList
                    integrationId={integrationId}
                    campaign={campaign}
                    canPerformActions={canCreateDeleteObjects}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                />
            </div>

            {campaign.ab_group?.status === ABGroupStatus.Completed && (
                <div>
                    <Button
                        className="mt-2 ml-4"
                        onClick={() => createCampaignManager.openModal()}
                    >
                        New Campaign From Winner
                    </Button>
                    <CampaignFromABTestModal
                        isOpen={createCampaignManager.isOpen()}
                        campaign={campaign}
                        integrationId={integrationId}
                        onClose={() => createCampaignManager.closeModal()}
                    />
                </div>
            )}
        </>
    )
}

export default ABTestSettingsPage
