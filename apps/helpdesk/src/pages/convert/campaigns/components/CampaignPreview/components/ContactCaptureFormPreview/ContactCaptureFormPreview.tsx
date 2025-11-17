import type React from 'react'
import { useState } from 'react'

import type { CampaignFormExtra } from 'pages/convert/campaigns/types/CampaignAttachment'
import type { CaptureFormDisclaimerSettings } from 'pages/convert/settings/types'

import { ContactCaptureStep } from './ContactCaptureStep'
import { Wrapper } from './styled'

export const DEFAULT_THANK_YOU_MESSAGE =
    'Thank you for showing your interest! 🤗'

export type ContactCaptureFormPreviewProps = {
    form: CampaignFormExtra
    onMessageHtmlChange?: (value: string) => void
    mainColor?: string
    emailDisclaimerSettings?: CaptureFormDisclaimerSettings
    defaultLanguage?: string
}

export const ContactCaptureFormPreview: React.FC<
    ContactCaptureFormPreviewProps
> = ({
    form,
    mainColor,
    onMessageHtmlChange,
    emailDisclaimerSettings,
    defaultLanguage,
}) => {
    const [isSubmitted, setIsSubmitted] = useState(false)

    const successMessage =
        form.on_success_content?.message || DEFAULT_THANK_YOU_MESSAGE

    const handleSubmit = () => {
        setIsSubmitted(true)
        onMessageHtmlChange?.(successMessage)
    }

    if (isSubmitted) {
        return null
    }

    const disclaimer =
        emailDisclaimerSettings?.disclaimer[defaultLanguage ?? '']

    return (
        <Wrapper>
            {form.steps.map((step, index) => (
                <ContactCaptureStep
                    key={index}
                    step={step}
                    mainColor={mainColor}
                    onSubmit={handleSubmit}
                    disclaimer={
                        emailDisclaimerSettings?.enabled ? disclaimer : ''
                    }
                    disclaimerDefaultAccepted={
                        emailDisclaimerSettings?.disclaimer_default_accepted ??
                        false
                    }
                />
            ))}
        </Wrapper>
    )
}
