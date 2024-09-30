import React, {
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react'

import {Button} from 'reactstrap'
import {
    transformAttachmentToTransitory,
    transformTransitoryToAttachment,
} from 'pages/convert/campaigns/components/ContactCaptureForm/utils'
import {TransitoryAttachmentData} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import css from 'pages/convert/campaigns/components/ContactCaptureForm/AddContactCaptureForm.less'
import Wizard, {
    WizardContext,
    WizardContextState,
} from 'pages/common/components/wizard/Wizard'
import {Drawer} from 'pages/common/components/Drawer'
import {STEPS} from 'pages/convert/campaigns/components/ContactCaptureForm/steps'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import EditorDrawerHeader from 'pages/automate/workflows/editor/visualBuilder/EditorDrawerHeader'
import {
    CampaignContactFormAttachment,
    CampaignFormExtra,
} from 'pages/convert/campaigns/types/CampaignAttachment'

type AddContactCaptureFormProps = {
    open: boolean
    onOpenChange: (openState: boolean) => void
    onSubmit?: (newAttachmentExtra: CampaignFormExtra) => void
    onCancel?: () => void
    onReset?: () => void
    buttonDisabled?: boolean
    initialAttachment?: CampaignContactFormAttachment
}

type AddContactCaptureFormInnerProps = {
    steps: typeof STEPS
} & AddContactCaptureFormProps

const AddContactCaptureInnerForm = (props: AddContactCaptureFormInnerProps) => {
    const [key, incrementKey] = useReducer((x: number) => x + 1, 0)
    const initialTransitoryData = useRef<TransitoryAttachmentData>({
        subscriberTypes: {
            shopify: {
                enabled: true,
                isEmailSubscriber: true,
                isSmsSubscriber: true,
                tags: [],
            },
        },
        forms: {
            email: {
                label: 'Email',
                cta: 'Subscribe',
                disclaimerEnabled: true,
                disclaimer:
                    'By entering the email address above, you opt in to receive marketing emails from [x]. ' +
                    'You can unsubscribe at any time. Terms of Use and Private Policy.',
                preSelectDisclaimer: false,
            },
        },
        postSubmissionMessage: {
            enabled: false,
            message: '',
        },
    })

    const [data, setData] = useState<TransitoryAttachmentData>(
        initialTransitoryData.current
    )

    const {
        open,
        onOpenChange,
        onCancel,
        onSubmit,
        onReset,
        steps,
        initialAttachment,
    } = props

    const isEditing = useMemo(
        () => !!initialAttachment?.extra,
        [initialAttachment]
    )

    useEffect(() => {
        if (initialAttachment?.extra) {
            const injectedTransitoryData = transformAttachmentToTransitory(
                initialAttachment.extra
            )
            initialTransitoryData.current = injectedTransitoryData
            setData(injectedTransitoryData)
        }
    }, [initialAttachment])

    const handleSubmit = () => {
        if (onSubmit) onSubmit(transformTransitoryToAttachment(data))
        onOpenChange(false)
    }

    const handleReset = () => {
        if (onReset) onReset()
        setData(initialTransitoryData.current)
        setActiveStep(steps[0].label)
        incrementKey()
    }

    const handleCancel = () => {
        handleReset()
        onOpenChange(false)
        if (onCancel) onCancel()
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
            aria-label="Email Capture"
            fullscreen={false}
            open={open}
            isLoading={false}
            className={css.contactWizardDrawer}
            onBackdropClick={() => onOpenChange(!open)}
            portalRootId="app-root"
            containerZIndices={[1051, -1]}
        >
            <EditorDrawerHeader
                label="Email Capture"
                onClose={handleCancel}
                testId="drawer-header"
                headerSaperator
            />
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
                        <div key={key} className={css.contactFormWizardStep}>
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
                    {isLastStep
                        ? isEditing
                            ? 'Update Form'
                            : 'Add Form'
                        : 'Next'}
                </Button>
            </Drawer.Footer>
        </Drawer>
    )
}

const AddContactCaptureForm = (props: AddContactCaptureFormProps) => (
    <>
        <Wizard steps={STEPS.map((step) => step.label)}>
            <AddContactCaptureInnerForm {...props} steps={STEPS} />
        </Wizard>
    </>
)

export default AddContactCaptureForm
