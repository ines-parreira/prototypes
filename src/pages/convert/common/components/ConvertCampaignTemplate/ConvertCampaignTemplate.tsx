import React from 'react'

import Button from 'pages/common/components/button/Button'

import {
    CampaignTemplate,
    CampaignTemplateLabelType,
} from 'pages/convert/campaigns/templates/types'
import css from './ConvertCampaignTemplate.less'

type Props = {
    template: CampaignTemplate
}

const campaignLabelStyles: Record<
    CampaignTemplateLabelType,
    {color: string; backgroundColor: string}
> = {
    [CampaignTemplateLabelType.IncreaseConversions]: {
        color: 'var(--accessory-blue-3)',
        backgroundColor: 'var(--accessory-blue-1)',
    },
    [CampaignTemplateLabelType.IncreaseAOV]: {
        color: 'var(--accessory-orange-3)',
        backgroundColor: 'var(--accessory-orange-1)',
    },
    [CampaignTemplateLabelType.PreventCartAbandonment]: {
        color: 'var(--accessory-magenta-3)',
        backgroundColor: 'var(--accessory-magenta-1)',
    },
}

const ConvertCampaignTemplate = ({template}: Props) => {
    return (
        <>
            <div className={css.container}>
                <div className={css.estimation}>
                    Generates <b>$1000/month</b> on average
                </div>
                <div className={css.preview}>
                    <img src={template.preview} alt={template.name} />
                </div>
                <div className={css.content}>
                    <div className={css.header}>
                        <div
                            className={css.label}
                            style={campaignLabelStyles[template.label]}
                        >
                            {template.label}
                        </div>
                    </div>
                    <div>
                        <div className={css.title}>{template.name}</div>
                    </div>

                    <div className={css.button}>
                        <Button intent="primary" fillStyle="ghost">
                            Customize
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConvertCampaignTemplate
