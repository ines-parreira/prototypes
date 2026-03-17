import { sanitizeHtmlDefault } from '@repo/utils'
import type { EditorState } from 'draft-js'

import { Card, CheckBoxField, Elevation, Heading, Text } from '@gorgias/axiom'

import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
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
    const handleRichFieldChange = (editorState: EditorState) => {
        let html = convertToHTML(editorState.getCurrentContent())
        html = sanitizeHtmlDefault(html)
        if (html === `<div><br></div>'` || html === '<div><br /></div>') {
            html = ''
        }
        onLegalDisclaimerTextChange(html)
    }

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Legal disclaimer</Heading>
                    <Text size="md" variant="regular">
                        Add any required legal notices, including an AI-powered
                        chat disclosure, that customers will see when starting a
                        conversation.
                    </Text>
                </div>
                <div className={css.legalMainContent}>
                    <div className={css.fieldSection}>
                        {legalDisclaimerText !== undefined && (
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
                        )}
                        <Text
                            size="sm"
                            variant="regular"
                            className={css.helperText}
                        >
                            We recommend disclosing that this chat is AI-powered
                            and linking to your privacy policy. Gorgias is not
                            responsible for compliance with applicable privacy
                            laws.
                        </Text>
                    </div>

                    <CheckBoxField
                        label="Show legal disclaimer to customers at the start of any conversation"
                        value={legalDisclaimerEnabled}
                        onChange={onLegalDisclaimerEnabledChange}
                    />
                </div>
            </div>
        </Card>
    )
}
