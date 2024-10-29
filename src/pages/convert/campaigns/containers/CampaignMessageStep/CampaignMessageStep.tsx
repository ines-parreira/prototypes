import {EditorState} from 'draft-js'
import React, {useEffect, useState} from 'react'

import {User} from 'config/types/user'

import RichField from 'pages/common/forms/RichField/RichField'
import {Value} from 'pages/common/forms/SelectField/types'
import {CampaignMessage} from 'pages/convert/campaigns/components/CampaignMessage'
import {StatefulAccordion} from 'pages/convert/campaigns/components/StatefulAccordion'
import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'

import {useStepState} from 'pages/convert/campaigns/hooks/useStepState'

import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {editorStateWithReplacedText} from 'utils/editor'

type Props = {
    agents: User[]
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isDisabled?: boolean
    isConvertSubscriber?: boolean
    showContentWarning?: boolean
    onDeleteAttachment: (index: number) => void
}

export const CampaignMessageStep = ({
    agents,
    count,
    isPristine = true,
    isValid = false,
    isDisabled = false,
    isConvertSubscriber = false,
    showContentWarning = false,
    onDeleteAttachment,
}: Props) => {
    const {campaign, updateCampaign} = useCampaignDetailsContext()
    const {isEditMode} = useCampaignFormContext()
    const stateProps = useStepState({
        count,
        isPristine,
        isValid,
        isEditMode,
        isDisabled,
    })

    const [richArea, setRichArea] = useState<RichField | null>(null)

    const handleChangeAgent = (value: Value) => updateCampaign('agent', value)

    const handleChangeMessage = (value: EditorState) =>
        updateCampaign('message', value)

    const onSuggestionApply = (suggestion: string) => {
        if (richArea) {
            const newEditorState = editorStateWithReplacedText(
                richArea.state.editorState,
                suggestion
            )
            richArea.setEditorState(newEditorState)
        }
    }

    // makes sure editor and preview are in sync on initial load of HTML
    useEffect(() => {
        if (richArea && isEditMode) {
            richArea.focusEditor()
        }
    }, [richArea, isEditMode])

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
                html={campaign.message_html || ''}
                text={campaign.message_text}
                isConvertSubscriber={isConvertSubscriber}
                selectedAgent={campaign.meta?.agentEmail ?? ''}
                shouldGenerateInitialSuggestion={!isEditMode}
                isAiCopyAssistantEnabled={!isPristine}
                onSelectAgent={handleChangeAgent}
                onChangeMessage={handleChangeMessage}
                onSuggestionApply={onSuggestionApply}
                onDeleteAttachment={onDeleteAttachment}
            />
        </StatefulAccordion>
    )
}
