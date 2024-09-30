import React, {useState} from 'react'

import {CampaignFormExtra} from 'pages/convert/campaigns/types/CampaignAttachment'
import {Wrapper} from './styled'
import {ContactCaptureStep} from './ContactCaptureStep'

export const DEFAULT_THANK_YOU_MESSAGE =
    'Thank you for showing your interest! 🤗'

export type ContactCaptureFormPreviewProps = {
    form: CampaignFormExtra
    onMessageHtmlChange?: (value: string) => void
    mainColor?: string
}

export const ContactCaptureFormPreview: React.FC<ContactCaptureFormPreviewProps> =
    ({form, mainColor, onMessageHtmlChange}) => {
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

        return (
            <Wrapper>
                {form.steps.map((step, index) => (
                    <ContactCaptureStep
                        key={index}
                        step={step}
                        mainColor={mainColor}
                        onSubmit={handleSubmit}
                        disclaimer={form.disclaimer}
                        disclaimerDefaultAccepted={
                            form.disclaimer_default_accepted
                        }
                    />
                ))}
            </Wrapper>
        )
    }
