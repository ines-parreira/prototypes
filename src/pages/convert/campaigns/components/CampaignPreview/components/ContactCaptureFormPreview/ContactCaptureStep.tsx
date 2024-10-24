import React, {useState, useMemo, useEffect} from 'react'

import {getContrastColor} from 'gorgias-design-system/utils'
import {
    ContactFormField,
    ContactFormFieldType,
    ContactFormStep,
} from 'pages/convert/campaigns/types/CampaignAttachment'

import {EmailCaptureField} from './EmailCaptureField'
import {SubmitButton, Disclaimer} from './styled'

const DEFAULT_COLOR = '#0097ff'

export type ContactCaptureStepProps = {
    step: ContactFormStep
    onSubmit: (data: Record<string, any>) => void
    disclaimer?: string | null
    disclaimerDefaultAccepted?: boolean
    mainColor?: string
}

export const ContactCaptureStep: React.FC<ContactCaptureStepProps> = ({
    step,
    onSubmit,
    disclaimer,
    disclaimerDefaultAccepted,
    mainColor,
}) => {
    const [policyAccepted, setPolicyAccepted] = useState(
        disclaimerDefaultAccepted || !disclaimer
    )
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [data, setData] = useState<Record<string, any>>({})

    const buttonStyle = useMemo(() => {
        const color = mainColor || DEFAULT_COLOR
        return {
            backgroundColor: color,
            borderColor: color,
            color: getContrastColor(color),
        }
    }, [mainColor])

    useEffect(() => {
        setPolicyAccepted(disclaimerDefaultAccepted ?? false)
    }, [disclaimerDefaultAccepted])

    const isFormValid = useMemo(() => {
        return step.fields.every((field) => {
            if (field.required) {
                return data[field.name]
            }
            return true
        })
    }, [step, data])

    const getField = (field: ContactFormField, index: number) => {
        switch (field.type) {
            case ContactFormFieldType.Email:
                return (
                    <EmailCaptureField
                        key={index}
                        field={field}
                        onChange={(value) =>
                            setData((prevState) => ({
                                ...prevState,
                                [field.name]: value,
                            }))
                        }
                    />
                )
            default:
                return null
        }
    }

    const handleOnSubmit = () => {
        setIsSubmitted(true)
        onSubmit(data)
    }

    if (isSubmitted) return null

    return (
        <>
            {step.fields.map(getField)}

            {disclaimer && (
                <Disclaimer>
                    <input
                        type="checkbox"
                        checked={policyAccepted}
                        onChange={(event) =>
                            setPolicyAccepted(event.target.checked)
                        }
                    />
                    <span
                        dangerouslySetInnerHTML={{
                            __html: disclaimer,
                        }}
                    ></span>
                </Disclaimer>
            )}

            <SubmitButton
                isStretched
                disabled={!policyAccepted || !isFormValid || isSubmitted}
                size="small"
                variant="primary"
                onClick={handleOnSubmit}
                style={buttonStyle}
            >
                {step.cta || 'Subscribe'}
            </SubmitButton>
        </>
    )
}
