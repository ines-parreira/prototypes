import React from 'react'

import {Link} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'

import {
    CampaignTemplate,
    CampaignTemplateLabelType,
} from 'pages/convert/campaigns/templates/types'
import css from './ConvertCampaignTemplate.less'

type Props = {
    template: CampaignTemplate
    integrationId: number
    selected: boolean
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

const ConvertCampaignTemplate = ({
    template,
    integrationId,
    selected,
}: Props) => {
    return (
        <>
            <div className={css.container}>
                {template.estimation && (
                    <div className={css.estimation}>
                        Generates <b>{template.estimation}</b> on average
                    </div>
                )}
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
                        {selected && (
                            <div className={css.selected}>
                                <i
                                    className="material-icons text-success"
                                    style={{fontSize: 24}}
                                >
                                    check_circle
                                </i>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className={css.title}>{template.name}</div>
                    </div>

                    <div className={css.button}>
                        <Link
                            to={`/app/convert/${integrationId}/setup/recommendations/${template.slug}`}
                        >
                            <Button intent="primary" fillStyle="ghost">
                                Customize
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConvertCampaignTemplate
