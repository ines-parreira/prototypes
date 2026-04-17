import { useRef } from 'react'

import { sanitizeHtmlDefault } from '@repo/utils'
import type { EditorState } from 'draft-js'

import { Card, CheckBoxField, Elevation, Heading, Text } from '@gorgias/axiom'

import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { convertToHTML } from 'utils/editor'

import css from '../GorgiasChatIntegrationAppearance.less'

type Props = {
    legalDisclaimerText: string | undefined
    legalDisclaimerEnabled: boolean
    onLegalDisclaimerTextChange: (value: string) => void
    onLegalDisclaimerEnabledChange: (value: boolean) => void
}

export const LegalCard = ({
    legalDisclaimerText,
    legalDisclaimerEnabled,
    onLegalDisclaimerTextChange,
    onLegalDisclaimerEnabledChange,
}: Props) => {
    const {
        displayPage,
        updateLegalDisclaimer,
        openChat,
        updateLegalDisclaimerEnabled,
    } = useChatPreviewPanelContext()

    const isEditorInitializing = useRef(true)

    const focusPreviewLegalDisclaimerSettings = () => {
        openChat()
        displayPage('conversation')
    }

    const handleRichFieldChange = (editorState: EditorState) => {
        let html = convertToHTML(editorState.getCurrentContent())
        html = sanitizeHtmlDefault(html)
        if (html === `<div><br></div>'` || html === '<div><br /></div>') {
            html = ''
        }

        updateLegalDisclaimer(html)
        onLegalDisclaimerTextChange(html)

        if (isEditorInitializing.current) {
            isEditorInitializing.current = false
            return
        }
        focusPreviewLegalDisclaimerSettings()
    }

    const handleLegalDisclaimerEnabled = (value: boolean) => {
        focusPreviewLegalDisclaimerSettings()
        onLegalDisclaimerEnabledChange(value)
        updateLegalDisclaimerEnabled(value)
    }

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Privacy policy</Heading>
                    <Text
                        size="md"
                        variant="regular"
                        className={css.cardDescription}
                    >
                        Add your privacy policy that shoppers will see in the
                        chat.
                    </Text>
                </div>
                <div className={css.legalMainContent}>
                    <div className={css.fieldSection}>
                        {legalDisclaimerText !== undefined && (
                            <div
                                className={css.focusWrapper}
                                onFocus={focusPreviewLegalDisclaimerSettings}
                            >
                                <TicketRichField
                                    value={{
                                        html: legalDisclaimerText,
                                        text: legalDisclaimerText,
                                    }}
                                    aria-label="Legal disclaimer"
                                    onChange={handleRichFieldChange}
                                    displayedActions={[
                                        ActionName.Bold,
                                        ActionName.Italic,
                                        ActionName.Underline,
                                        ActionName.Link,
                                        ActionName.Emoji,
                                    ]}
                                    canDropFiles={false}
                                    canInsertInlineImages={false}
                                />
                            </div>
                        )}
                        <Text
                            size="sm"
                            variant="regular"
                            className={css.helperText}
                        >
                            Gorgias is not responsible for compliance with
                            applicable privacy laws.
                        </Text>
                    </div>

                    <div
                        className={css.focusWrapper}
                        onFocus={focusPreviewLegalDisclaimerSettings}
                    >
                        <CheckBoxField
                            label="Show privacy policy at the start of a conversation"
                            value={legalDisclaimerEnabled}
                            onChange={handleLegalDisclaimerEnabled}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
