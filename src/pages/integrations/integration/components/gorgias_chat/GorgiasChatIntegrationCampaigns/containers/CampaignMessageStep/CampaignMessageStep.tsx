import React, {useEffect, useState} from 'react'
import {EditorState} from 'draft-js'
import {List} from 'immutable'

import {User} from 'config/types/user'

import RichField from 'pages/common/forms/RichField/RichField'
import {Value} from 'pages/common/forms/SelectField/types'

import {useStepState} from '../../hooks/useStepState'
import {useCampaignDetailsContext} from '../../hooks/useCampaignDetailsContext'

import {CampaignMessage} from '../../components/CampaignMessage'
import {StatefulAccordion} from '../../components/StatefulAccordion'

import {CampaignStepsKeys} from '../../types/CampaignSteps'

type Props = {
    agents: User[]
    attachments: List<any>
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isConvertSubscriber?: boolean
    showContentWarning?: boolean
    onDeleteAttachment: (index: number) => void
}

export const CampaignMessageStep = ({
    agents,
    attachments = List(),
    count,
    isPristine = true,
    isValid = false,
    isConvertSubscriber = false,
    showContentWarning = false,
    onDeleteAttachment,
}: Props) => {
    const {campaign, isEditMode, updateCampaign} = useCampaignDetailsContext()
    const stateProps = useStepState({count, isPristine, isValid, isEditMode})

    const [richArea, setRichArea] = useState<RichField | null>(null)

    const handleChangeAgent = (value: Value) => updateCampaign('agent', value)

    const handleChangeMessage = (value: EditorState) =>
        updateCampaign('message', value)

    // makes sure editor and preview are in sync on initial load of HTML
    useEffect(() => {
        if (richArea) richArea.focusEditor()
    }, [richArea])

    return (
        <StatefulAccordion
            {...stateProps}
            id={CampaignStepsKeys.Message}
            title="Write your message"
        >
            <CampaignMessage
                richAreaRef={(ref) => setRichArea(ref)}
                showContentWarning={showContentWarning}
                agents={agents}
                attachments={attachments}
                html={campaign.message.html}
                text={campaign.message.text}
                isConvertSubscriber={isConvertSubscriber}
                selectedAgent={campaign.message.author?.email ?? ''}
                onSelectAgent={handleChangeAgent}
                onChangeMessage={handleChangeMessage}
                onDeleteAttachment={onDeleteAttachment}
            />
        </StatefulAccordion>
    )
}
