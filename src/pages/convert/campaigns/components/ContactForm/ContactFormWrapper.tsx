import React, {useContext, useMemo, useState} from 'react'

import {Button} from 'reactstrap'
import css from 'pages/convert/campaigns/components/ContactForm/ContactFormWrapper.less'
import Wizard, {
    WizardContext,
    WizardContextState,
} from 'pages/common/components/wizard/Wizard'
import {Drawer} from 'pages/common/components/Drawer'
import {STEPS} from 'pages/convert/campaigns/components/ContactForm/steps'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import EditorDrawerHeader from 'pages/automate/workflows/editor/visualBuilder/EditorDrawerHeader'
import {
    CampaignDiscountOfferAttachment,
    CampaignFormExtra,
    ContactFormField,
    ContactFormTarget,
} from 'pages/convert/campaigns/types/CampaignAttachment'

type ContactFormWrapperProps = {
    open: boolean
    onOpenChange: (openState: boolean) => void
    onSubmit?: () => void
    onCancel?: () => void
    onReset?: () => void
}

type ContactFormProps = {
    steps: typeof STEPS
} & ContactFormWrapperProps

const ContactForm = (props: ContactFormProps) => {
    const [data, setData] = useState<CampaignFormExtra>({
        fields: [] as ContactFormField[],
        after_form_content: {cta: '', disclaimer: ''},
        on_success_content: {
            message: '',
            attachments: [] as CampaignDiscountOfferAttachment[],
        },
        targets: [
            {type: 'shopify', subscriber_types: ['email'], tags: []},
        ] as ContactFormTarget[],
    })

    const {open, onOpenChange, onCancel, onSubmit, onReset, steps} = props

    const handleCancel = () => {
        onOpenChange(false)
        if (onCancel) onCancel()
    }

    const handleSubmit = () => {
        onOpenChange(false)
        if (onSubmit) onSubmit()
    }

    const handleReset = () => {
        if (onReset) onReset()
    }

    const {activeStepIndex, setActiveStep, previousStep, activeStep, nextStep} =
        useContext(WizardContext) as WizardContextState

    const isFirstStep = useMemo(() => activeStepIndex === 0, [activeStepIndex])
    const isLastStep = useMemo(
        () => activeStepIndex === STEPS.length - 1,
        [activeStepIndex]
    )

    const onClickBack = () => {
        if (isFirstStep) {
            handleCancel()
            return
        }
        setActiveStep(previousStep ?? activeStep)
    }

    const onClickNext = () => {
        if (isLastStep) {
            handleSubmit()
            return
        }
        setActiveStep(nextStep ?? activeStep)
    }

    const [nextButtonActive, setNextButtonActive] = useState(false)

    return (
        <Drawer
            name="Contact Form"
            fullscreen={false}
            open={open}
            isLoading={false}
            className={css.contactWizardDrawer}
        >
            <EditorDrawerHeader
                label="Contact Form"
                onClose={handleCancel}
                testId="drawer-header"
                headerSaperator
            ></EditorDrawerHeader>
            <Drawer.Content className={css.drawerContent}>
                <WizardProgressHeader
                    labels={steps.reduce((acc, step) => {
                        acc[step.label] = step.label
                        return acc
                    }, {} as Record<string, string>)}
                    className={css.wizardHeaderContainer}
                />
                {steps.map((step, idx) => (
                    <WizardStep key={idx} name={step.label}>
                        <div className={css.contactFormWizardStep}>
                            {step.getComponent({
                                setNextButtonActive: setNextButtonActive,
                                attachmentData: data,
                                setAttachmentData: setData,
                            })}
                        </div>
                    </WizardStep>
                ))}
            </Drawer.Content>
            <Drawer.Footer className={css.wizardFooterButtons}>
                <Button
                    className={css.resetBtn}
                    fillStyle="ghost"
                    color="secondary"
                    onClick={handleReset}
                >
                    Reset
                </Button>
                <div className={css.buttonsSeparator}></div>
                <Button onClick={onClickBack}>
                    {isFirstStep ? 'Cancel' : 'Previous'}
                </Button>
                <Button
                    onClick={onClickNext}
                    color="primary"
                    disabled={!nextButtonActive}
                >
                    {isLastStep ? 'Add Form' : 'Next'}
                </Button>
            </Drawer.Footer>
        </Drawer>
    )
}

const ConctactFromWrapper = (props: ContactFormWrapperProps) => (
    <Wizard steps={STEPS.map((step) => step.label)}>
        <ContactForm {...props} steps={STEPS} />
    </Wizard>
)

export default ConctactFromWrapper
