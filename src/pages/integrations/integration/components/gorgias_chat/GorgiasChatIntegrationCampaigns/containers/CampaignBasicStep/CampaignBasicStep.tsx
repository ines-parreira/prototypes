import React from 'react'

import InputField from 'pages/common/forms/input/InputField'

import {useStepState} from '../../hooks/useStepState'
import {useCampaignDetailsContext} from '../../hooks/useCampaignDetailsContext'

import {StatefulAccordion} from '../../components/StatefulAccordion'

import {CampaignStepsKeys} from '../../types/CampaignSteps'

type Props = {
    count?: number
    isPristine?: boolean
    isValid?: boolean
}

export const CampaignBasicStep = ({
    count,
    isPristine = true,
    isValid = false,
}: Props) => {
    const {campaign, isEditMode, updateCampaign} = useCampaignDetailsContext()
    const stateProps = useStepState({count, isPristine, isValid, isEditMode})

    const handleUpdateName = (value: string) => updateCampaign('name', value)

    return (
        <StatefulAccordion
            {...stateProps}
            id={CampaignStepsKeys.Basics}
            title="Set up the basics"
        >
            <InputField
                isRequired
                label="Campaign name"
                aria-label="Campaign name"
                placeholder="My new campaign"
                value={campaign.name}
                onChange={handleUpdateName}
            />
        </StatefulAccordion>
    )
}
