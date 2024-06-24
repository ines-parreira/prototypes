import React from 'react'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import Triggers from 'pages/convert/onboarding/components/SimpleCampaignEditor/components/Triggers'

import css from './SimpleCampaignEditor.less'

type Props = {
    campaign?: Campaign
}

export const SimpleCampaignEditor: React.FC<Props> = ({campaign}) => {
    return (
        <>
            <div className={css.section}>
                <div className={css.sectionHeader}>
                    <span>Conditions to display campaign:</span>
                </div>
                <div>
                    <Triggers
                        triggers={campaign?.triggers}
                        campaignMeta={campaign?.meta}
                    />
                </div>
            </div>

            <div className={css.section}>
                <div className={css.sectionHeader}>
                    <span>
                        Customize your message and add product recommendations:
                    </span>
                </div>
                <div>Editor</div>
            </div>
        </>
    )
}

export default SimpleCampaignEditor
