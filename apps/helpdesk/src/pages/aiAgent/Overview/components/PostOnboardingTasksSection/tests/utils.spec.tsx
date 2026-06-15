import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

import {
    decideChatWarning,
    DEFAULT_POST_ONBOARDING_STEPS,
    handleAiAgentConfigurationError,
    mapTabToStepName,
    POST_ONBOARDING_STEPS_METADATA,
} from '../utils'

jest.mock('utils', () => ({
    assetsUrl: (path: string) => `mocked-assets-url${path}`,
}))

describe('PostOnboardingTasksSection utils', () => {
    describe('POST_ONBOARDING_STEPS_METADATA', () => {
        it('should contain metadata for all steps', () => {
            expect(POST_ONBOARDING_STEPS_METADATA).toHaveProperty('TRAIN')
            expect(POST_ONBOARDING_STEPS_METADATA).toHaveProperty('TEST')
            expect(POST_ONBOARDING_STEPS_METADATA).toHaveProperty('DEPLOY')

            expect(POST_ONBOARDING_STEPS_METADATA.TRAIN.stepName).toBe(
                StepName.TRAIN,
            )
            expect(POST_ONBOARDING_STEPS_METADATA.TEST.stepName).toBe(
                StepName.TEST,
            )
            expect(POST_ONBOARDING_STEPS_METADATA.DEPLOY.stepName).toBe(
                StepName.DEPLOY,
            )
        })

        it('should include step titles and descriptions', () => {
            expect(POST_ONBOARDING_STEPS_METADATA.TRAIN.stepTitle).toBe(
                'Train AI Agent',
            )
            expect(
                POST_ONBOARDING_STEPS_METADATA.TRAIN.stepDescription,
            ).toBeTruthy()

            expect(POST_ONBOARDING_STEPS_METADATA.TEST.stepTitle).toBe(
                'Test AI Agent',
            )
            expect(
                POST_ONBOARDING_STEPS_METADATA.TEST.stepDescription,
            ).toBeTruthy()

            expect(POST_ONBOARDING_STEPS_METADATA.DEPLOY.stepTitle).toBe(
                'Deploy AI Agent',
            )
            expect(
                POST_ONBOARDING_STEPS_METADATA.DEPLOY.stepDescription,
            ).toBeTruthy()
        })

        it('should include step images for TRAIN and TEST steps', () => {
            expect(POST_ONBOARDING_STEPS_METADATA.TRAIN.stepImage).toBe(
                'mocked-assets-url/img/ai-agent/post_onboarding_task_guidance.png',
            )
            expect(POST_ONBOARDING_STEPS_METADATA.TEST.stepImage).toBe(
                'mocked-assets-url/img/ai-agent/post_onboarding_task_test.png',
            )
        })
    })

    describe('DEFAULT_POST_ONBOARDING_STEPS', () => {
        it('should have the correct structure', () => {
            expect(DEFAULT_POST_ONBOARDING_STEPS).toHaveProperty('status')
            expect(DEFAULT_POST_ONBOARDING_STEPS).toHaveProperty('type')
            expect(DEFAULT_POST_ONBOARDING_STEPS).toHaveProperty(
                'stepsConfiguration',
            )
            expect(DEFAULT_POST_ONBOARDING_STEPS).toHaveProperty(
                'notificationsConfiguration',
            )
            expect(DEFAULT_POST_ONBOARDING_STEPS).toHaveProperty(
                'completedDatetime',
            )
        })

        it('should include all three steps in stepsConfiguration', () => {
            const steps = DEFAULT_POST_ONBOARDING_STEPS.stepsConfiguration
            expect(steps).toHaveLength(3)

            const stepNames = steps.map((step) => step.stepName)
            expect(stepNames).toContain(StepName.TRAIN)
            expect(stepNames).toContain(StepName.TEST)
            expect(stepNames).toContain(StepName.DEPLOY)
        })

        it('should have null datetime values by default', () => {
            const steps = DEFAULT_POST_ONBOARDING_STEPS.stepsConfiguration
            steps.forEach((step) => {
                expect(step.stepStartedDatetime).toBeNull()
                expect(step.stepCompletedDatetime).toBeNull()
                expect(step.stepDismissedDatetime).toBeNull()
            })

            expect(DEFAULT_POST_ONBOARDING_STEPS.completedDatetime).toBeNull()
            expect(
                DEFAULT_POST_ONBOARDING_STEPS.notificationsConfiguration
                    .guidanceInactivityAcknowledgedAt,
            ).toBeNull()
            expect(
                DEFAULT_POST_ONBOARDING_STEPS.notificationsConfiguration
                    .deployInactivityAcknowledgedAt,
            ).toBeNull()
        })
    })

    describe('mapTabToStepName', () => {
        it('should map tab names to step names correctly', () => {
            expect(mapTabToStepName('train')).toBe(StepName.TRAIN)
            expect(mapTabToStepName('test')).toBe(StepName.TEST)
            expect(mapTabToStepName('deploy')).toBe(StepName.DEPLOY)
        })

        it('should return null for invalid tab names', () => {
            expect(mapTabToStepName('invalid')).toBeNull()
            expect(mapTabToStepName('')).toBeNull()
        })

        it('should return null for null input', () => {
            expect(mapTabToStepName(null)).toBeNull()
        })
    })

    describe('decideChatWarning', () => {
        const mockRoutes = { deployChat: '/mock/deploy-chat-route' }

        it('should return "Configure a chat" warning when no chat channels exist', () => {
            const result = decideChatWarning([], [], mockRoutes)

            expect(result.visible).toBe(true)
            if (result.visible) {
                expect(result.label).toBe('Configure a chat')
                expect(result.to).toBe(
                    '/app/settings/channels/gorgias_chat/new/create-wizard',
                )
            }
        })

        it('should return "Connect a chat" warning when no monitored IDs exist', () => {
            const chatChannels = [
                { value: { id: 1, isUninstalled: false } },
            ] as any

            const result = decideChatWarning(chatChannels, [], mockRoutes)

            expect(result.visible).toBe(true)
            if (result.visible) {
                expect(result.label).toBe('Connect a chat')
                expect(result.to).toBe('/mock/deploy-chat-route')
            }
        })

        it('should return "Connect a chat" warning when monitored ID does not match any channel', () => {
            const chatChannels = [
                { value: { id: 1, isUninstalled: false } },
            ] as any

            const result = decideChatWarning(chatChannels, ['2'], mockRoutes)

            expect(result.visible).toBe(true)
            if (result.visible) {
                expect(result.label).toBe('Connect a chat')
                expect(result.to).toBe('/mock/deploy-chat-route')
            }
        })

        it('should return "Install a chat" warning when a monitored chat is uninstalled', () => {
            const chatChannels = [
                { value: { id: 1, isUninstalled: true } },
            ] as any

            const result = decideChatWarning(chatChannels, ['1'], mockRoutes)

            expect(result.visible).toBe(true)
            if (result.visible) {
                expect(result.label).toBe('Install a chat')
                expect(result.to).toBe(
                    '/app/settings/channels/gorgias_chat/1/installation',
                )
            }
        })

        it('should return { visible: false } when all conditions are met', () => {
            const chatChannels = [
                { value: { id: 1, isUninstalled: false } },
            ] as any

            const result = decideChatWarning(chatChannels, ['1'], mockRoutes)

            expect(result.visible).toBe(false)
        })

        it('should handle undefined inputs', () => {
            const result = decideChatWarning(undefined, undefined, mockRoutes)

            expect(result.visible).toBe(true)
            if (result.visible) {
                expect(result.label).toBe('Configure a chat')
            }
        })
    })

    describe('handleAiAgentConfigurationError', () => {
        const renderErrorHandler = async (error: unknown) => {
            const { user } = render(
                <button
                    type="button"
                    onClick={() => handleAiAgentConfigurationError(error)}
                >
                    Show error
                </button>,
            )

            await user.click(screen.getByRole('button', { name: 'Show error' }))
        }

        it('shows specific error toast for 409 conflict errors', async () => {
            const conflictError = {
                isAxiosError: true,
                response: { status: 409 },
            }

            await renderErrorHandler(conflictError)

            expect(
                await screen.findByRole('status', {
                    name: 'One or more selected integrations are already used in another AI Agent. To continue, unselect the duplicated integrations and try again.',
                }),
            ).toBeInTheDocument()
        })

        it('shows generic error toast for other errors', async () => {
            const genericError = new Error('Generic error')

            await renderErrorHandler(genericError)

            expect(
                await screen.findByRole('status', {
                    name: 'Failed to save AI Agent configuration',
                }),
            ).toBeInTheDocument()
        })

        it('shows generic error toast for non-409 Axios errors', async () => {
            const nonConflictAxiosError = {
                isAxiosError: true,
                response: { status: 500 },
            }

            await renderErrorHandler(nonConflictAxiosError)

            expect(
                await screen.findByRole('status', {
                    name: 'Failed to save AI Agent configuration',
                }),
            ).toBeInTheDocument()
        })
    })
})
