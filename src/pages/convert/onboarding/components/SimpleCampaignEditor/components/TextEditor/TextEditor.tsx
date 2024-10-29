import {EditorState} from 'draft-js'
import {produce} from 'immer'
import React, {useEffect, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'

import RichField from 'pages/common/forms/RichField/RichField'
import {CampaignMessage} from 'pages/convert/campaigns/components/CampaignMessage'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {deleteAttachment} from 'state/newMessage/actions'
import {convertToHTML, editorStateWithReplacedText} from 'utils/editor'

type Props = {
    campaign: Campaign
    isConvertSubscriber?: boolean
    showContentWarning?: boolean
    onCampaignUpdate: (data: any) => void
}

const TextEditor: React.FC<Props> = (props) => {
    const {campaign, isConvertSubscriber, onCampaignUpdate} = props

    const [richArea, setRichArea] = useState<RichField | null>(null)

    const dispatch = useAppDispatch()

    const handleChangeMessage = (value: EditorState) => {
        const content = value.getCurrentContent()
        const lastChange = value.getLastChangeType()

        if (lastChange === undefined) {
            return
        }

        onCampaignUpdate(
            produce((draft: Campaign) => {
                draft.message_text = content.getPlainText()
                draft.message_html = convertToHTML(content)
            })
        )
    }

    const handleDeleteAttachment = (index: number) => {
        dispatch(deleteAttachment(index))
    }

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
        if (richArea) richArea.focusEditor()
    }, [richArea])

    return (
        <div className="simplified-editor">
            <CampaignMessage
                richAreaRef={(ref) => setRichArea(ref)}
                showContentWarning={false}
                showAgentSelector={false}
                agents={[]}
                html={campaign.message_html || ''}
                text={campaign.message_text}
                isConvertSubscriber={isConvertSubscriber}
                selectedAgent={campaign.meta?.agentEmail ?? ''}
                shouldGenerateInitialSuggestion={false}
                isAiCopyAssistantEnabled={true}
                onSelectAgent={() => {}}
                onChangeMessage={handleChangeMessage}
                onSuggestionApply={onSuggestionApply}
                onDeleteAttachment={handleDeleteAttachment}
            />
        </div>
    )
}

export default TextEditor
