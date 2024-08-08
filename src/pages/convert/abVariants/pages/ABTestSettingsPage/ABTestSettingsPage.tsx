import React from 'react'
import {Link} from 'react-router-dom'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import {HeaderReturnButton} from 'pages/convert/common/components/HeaderReturnButton'
import VariantsList from 'pages/convert/abVariants/components/VariantsList'

import css from './ABTestSettingsPage.less'

type Props = {
    variants: CampaignVariant[]
}

export const ABTestSettingsPage: React.FC<Props> = ({variants}) => {
    return (
        <>
            <div className={css.pageContentWithPadding}>
                <div className={css.subHeader}>
                    <HeaderReturnButton
                        backToHref={'/app/convert/4/campaigns'}
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

                <div className={css.alertWrapper}>
                    <Alert icon type={AlertType.Info}>
                        Your campaign is still running as your “Control
                        Variant”. Once the A/B test is started, traffic will be
                        evenly distributed across your variants.
                    </Alert>
                </div>

                <div className={css.variantWrapper}>
                    <h2>Variants</h2>
                    <p>
                        View and manage your variants here. Access the full
                        performance data on the{' '}
                        <Link to={'/to'}>
                            <strong>performance dashboard</strong>
                        </Link>
                        .
                    </p>
                </div>
            </div>

            <div>
                <VariantsList variants={variants} />
            </div>
        </>
    )
}

export default ABTestSettingsPage
