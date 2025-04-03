import { render } from '@testing-library/react'

import { WizardContext } from 'pages/common/components/wizard/Wizard'
import { assumeMock } from 'utils/testing'

import VoiceFormUnsavedChangesPrompt from '../../VoiceFormUnsavedChangesPrompt'
import { VoiceIntegrationOnboardingStep } from '../constants'
import VoiceIntegrationOnboardingUnsavedChangesPrompt from '../VoiceIntegrationOnboardingUnsavedChangesPrompt'

jest.mock('../useVoiceOnboardingForm', () => ({
    useOnboardingForm: () => ({
        onSubmit: jest.fn(),
    }),
}))

jest.mock('../../VoiceFormUnsavedChangesPrompt')
const VoiceFormUnsavedChangesPromptMock = assumeMock(
    VoiceFormUnsavedChangesPrompt,
)

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
        VoiceFormUnsavedChangesPromptMock.mockReturnValue(
            <div>VoiceFormUnsavedChangesPrompt</div>,
        )
    })

    it('should render with correct title', () => {
        renderComponent()

        expect(VoiceFormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Leave voice integration setup?',
                body: undefined,
            }),
            {},
        )
    })

    it('should show body text when hasNewPhoneNumber is true', () => {
        renderComponent({ hasNewPhoneNumber: true })

        expect(VoiceFormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.anything(),
            }),
            {},
        )
    })

    it('should not show body text when hasNewPhoneNumber is false', () => {
        renderComponent({ hasNewPhoneNumber: false })

        expect(VoiceFormUnsavedChangesPromptMock).toHaveBeenCalledWith(
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

        expect(VoiceFormUnsavedChangesPromptMock).toHaveBeenCalledWith(
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

        expect(VoiceFormUnsavedChangesPromptMock).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldShowSaveButton: false,
            }),
            {},
        )
    })
})
