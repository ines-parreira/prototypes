import React, {useMemo, useState} from 'react'
import {Map} from 'immutable'

import {Link} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'

import {
    CampaignTemplate,
    CampaignTemplateLabelType,
} from 'pages/convert/campaigns/templates/types'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentHelpdeskPlan} from 'state/billing/selectors'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

import {useIsConvertSimplifiedEditorEnabled} from 'pages/convert/common/hooks/useIsConvertSimplifiedEditorEnabled'
import ConvertSimplifiedEditorModal from 'pages/convert/onboarding/components/ConvertSimplifiedEditorModal'

import css from './ConvertOnboardingCampaignTemplate.less'

type Props = {
    template: CampaignTemplate
    selected: boolean
    integration: Map<any, any>
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

const ConvertOnboardingCampaignTemplate = ({
    template,
    integration,
    selected,
}: Props) => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isSimplifiedEditorEnabled = useIsConvertSimplifiedEditorEnabled()

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
                    {!isSimplifiedEditorEnabled ? (
                        <Link
                            to={`/app/convert/${integration.get(
                                'id'
                            )}/setup/wizard/${template.slug}`}
                        >
                            <Button intent="primary" fillStyle="ghost">
                                Customize
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            intent="primary"
                            fillStyle="ghost"
                            onClick={openModal}
                        >
                            Customize
                        </Button>
                    )}
                </div>
            </div>
            {isSimplifiedEditorEnabled && (
                <ConvertSimplifiedEditorModal
                    estimatedRevenue={estimatedRevenue}
                    template={template}
                    integration={integration}
                    isOpen={isModalOpen}
                    onClose={onClose}
                />
            )}
        </div>
    )
}

export default ConvertOnboardingCampaignTemplate
