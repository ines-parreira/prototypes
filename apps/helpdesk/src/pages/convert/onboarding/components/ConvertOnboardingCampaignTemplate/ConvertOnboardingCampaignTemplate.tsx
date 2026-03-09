import React, { useMemo, useState } from 'react'

import { convertLegacyPlanNameToPublicPlanName } from '@repo/billing-utils'
import type { Map } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { CampaignTemplate } from 'pages/convert/campaigns/templates/types'
import { CampaignTemplateLabelType } from 'pages/convert/campaigns/templates/types'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import ConvertSimplifiedEditorModal from 'pages/convert/onboarding/components/ConvertSimplifiedEditorModal'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'

import css from './ConvertOnboardingCampaignTemplate.less'

type Props = {
    template: CampaignTemplate
    selected: boolean
    campaign: Campaign | undefined
    integration: Map<any, any>
}

const campaignLabelStyles: Record<
    CampaignTemplateLabelType,
    { color: string; backgroundColor: string }
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

const ConvertOnboardingCampaignTemplate = ({
    template,
    integration,
    campaign,
    selected,
}: Props) => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const onClose = () => {
        setIsModalOpen(false)
    }

    const openModal = () => {
        setIsModalOpen(true)
    }

    const estimatedRevenue = useMemo(() => {
        const planName =
            currentHelpdeskPlan &&
            convertLegacyPlanNameToPublicPlanName(currentHelpdeskPlan.name)

        if (template.estimation && planName && template.estimation[planName]) {
            return template.estimation[planName]
        }
    }, [currentHelpdeskPlan, template])

    return (
        <div className={css.container}>
            {estimatedRevenue && (
                <div className={css.estimation}>
                    Generates <b>{estimatedRevenue}</b> on average
                </div>
            )}
            <div className={css.preview}>
                <img src={template.preview} alt={template.name} />
            </div>
            <div className={css.content}>
                <div className={css.header}>
                    {template.label && (
                        <div
                            className={css.label}
                            style={campaignLabelStyles[template.label]}
                        >
                            {template.label}
                        </div>
                    )}
                    {selected && (
                        <div className={css.selected}>
                            <i
                                className="material-icons text-success"
                                style={{ fontSize: 24 }}
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
                    <Button
                        intent="primary"
                        fillStyle="ghost"
                        onClick={openModal}
                    >
                        Customize
                    </Button>
                </div>
            </div>
            <ConvertSimplifiedEditorModal
                campaign={campaign}
                estimatedRevenue={estimatedRevenue}
                template={template}
                integration={integration}
                isOpen={isModalOpen}
                onClose={onClose}
            />
        </div>
    )
}

export default ConvertOnboardingCampaignTemplate
