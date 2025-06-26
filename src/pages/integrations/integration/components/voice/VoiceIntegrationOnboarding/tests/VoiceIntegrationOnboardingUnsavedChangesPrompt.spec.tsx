import { render } from '@testing-library/react'

import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import { WizardContext } from 'pages/common/components/wizard/Wizard'
import { assumeMock } from 'utils/testing'

import { VoiceIntegrationOnboardingStep } from '../constants'
import VoiceIntegrationOnboardingUnsavedChangesPrompt from '../VoiceIntegrationOnboardingUnsavedChangesPrompt'

jest.mock('../useVoiceOnboardingForm', () => ({
    useOnboardingForm: () => ({
        onSubmit: jest.fn(),
    }),
}))

jest.mock('pages/common/components/FormUnsavedChangesPrompt')
const FormUnsavedChangesPromptMock = assumeMock(FormUnsavedChangesPrompt)

describe('VoiceIntegrationOnboardingUnsavedChangesPrompt', () => {
    const renderComponent = ({
        hasNewPhoneNumber = false,
        activeStep = VoiceIntegrationOnboardingStep.AddPhoneNumber,
    }: {
        hasNewPhoneNumber?: boolean
        activeStep?: VoiceIntegrationOnboardingStep
    } = {}) => {
        const wizardContextValue = {
            activeStep,
        } as any

        return render(
            <WizardContext.Provider value={wizardContextValue}>
                <VoiceIntegrationOnboardingUnsavedChangesPrompt
                    hasNewPhoneNumber={hasNewPhoneNumber}
                />
            </WizardContext.Provider>,
        )
    }

    beforeEach(() => {
        FormUnsavedChangesPromptMock.mockReturnValue(
            <div>FormUnsavedChangesPrompt</div>,
        )
    })

    it('should render with correct title', () => {
        renderComponent()

        expect(FormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Leave voice integration setup?',
                body: undefined,
            }),
            {},
        )
    })

    it('should show body text when hasNewPhoneNumber is true', () => {
        renderComponent({ hasNewPhoneNumber: true })

        expect(FormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.anything(),
            }),
            {},
        )
    })

    it('should not show body text when hasNewPhoneNumber is false', () => {
        renderComponent({ hasNewPhoneNumber: false })

        expect(FormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldShowSaveButton: false,
            }),
            {},
        )
    })

    it('should show save button only on ConfigureRoutingBehavior step', () => {
        renderComponent({
            hasNewPhoneNumber: false,
            activeStep: VoiceIntegrationOnboardingStep.ConfigureRoutingBehavior,
        })

        expect(FormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldShowSaveButton: true,
            }),
            {},
        )
    })

    it('should not show save button on AddPhoneNumber step', () => {
        renderComponent({
            hasNewPhoneNumber: false,
            activeStep: VoiceIntegrationOnboardingStep.AddPhoneNumber,
        })

        expect(FormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldShowSaveButton: false,
            }),
            {},
        )
    })
})
