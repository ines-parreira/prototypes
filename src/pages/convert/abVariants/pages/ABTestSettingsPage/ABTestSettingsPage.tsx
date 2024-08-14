import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import {HeaderReturnButton} from 'pages/convert/common/components/HeaderReturnButton'
import VariantsList from 'pages/convert/abVariants/components/VariantsList'
import {ABGroupStatus} from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import {isActiveStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'

import css from './ABTestSettingsPage.less'

type Props = {
    campaign: Campaign
    integrationId: string
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
                campaign.ab_group?.status ?? ''
            ) >= 0
        )
    }, [campaign])

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
                            href=""
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
                    campaign={campaign}
                    canPerformActions={canCreateDeleteObjects}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                />
            </div>
        </>
    )
}

export default ABTestSettingsPage
