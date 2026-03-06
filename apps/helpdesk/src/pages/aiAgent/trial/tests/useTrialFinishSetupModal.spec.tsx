import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'
import { create } from 'react-test-renderer'

import useAppSelector from 'hooks/useAppSelector'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import type { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialFinishSetupModal } from 'pages/aiAgent/trial/hooks/useTrialFinishSetupModal'
import { renderHookWithRouter } from 'tests/renderHookWithRouter'

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('hooks/useAppSelector')
jest.mock('@repo/feature-flags')

const mockUseShoppingAssistantTrialFlow = assumeMock(
    useShoppingAssistantTrialFlow,
)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseFlag = assumeMock(useFlag)

const defaultMockUseShoppingAssistantTrialFlow =
    getUseShoppingAssistantTrialFlowFixture()

describe('useTrialFinishSetupModal', () => {
    const mockStoreName = 'test-store'
    const mockPropsShoppingAssistant = {
        trialType: TrialType.ShoppingAssistant,
        storeName: mockStoreName,
        isOnboarded: true,
    }

    const mockPropsAiAgent = {
        trialType: TrialType.AiAgent,
        storeName: mockStoreName,
        isOnboarded: false,
    }

    const expectedTitleTree = create(
        <>
            Ready. Set. Grow. <br />
            Your 14-day trial starts <br />
            now.
        </>,
    ).toJSON()

    beforeEach(() => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector.name === 'getCurrentAccountState') {
                return fromJS({
                    id: 1234,
                    domain: 'test.myaccount.com',
                })
            }
            return null
        })
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                [mockStoreName]: storeActivationFixture(),
            },
            allStoreActivations: {},
            progressPercentage: 0,
            isFetchLoading: false,
            isSaveLoading: false,
            changeSales: jest.fn(),
            changeSupport: jest.fn(),
            changeSupportChat: jest.fn(),
            changeSupportEmail: jest.fn(),
            saveStoreConfigurations: jest.fn(),
            migrateToNewPricing: jest.fn(),
            endTrial: jest.fn(),
            activation: jest.fn(),
        })
        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            defaultMockUseShoppingAssistantTrialFlow,
        )
        mockUseFlag.mockReturnValue(false)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Shopping Assistant trial type', () => {
        it('should return correct modal props when AI agent is onboarded', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsShoppingAssistant),
            )

            const modal = result.current
            const titleTree = create(modal.title as React.ReactElement).toJSON()
            expect(titleTree).toEqual(expectedTitleTree)
            expect(modal.subtitle).toBe("Let's unlock its full potential.")
            expect(modal.content).toBe(
                'Just two simple steps to increase conversions and make the most of your trial.',
            )
            expect(modal.primaryAction?.label).toBe('Finish setup')
            expect(modal.isOpen).toBe(false)
            expect(modal.onClose).toEqual(expect.any(Function))
            expect(modal.features).toHaveLength(3)
        })

        it('should return isOpen as true when modal is open', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                isTrialFinishSetupModalOpen: true,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsShoppingAssistant),
            )

            expect(result.current.isOpen).toBe(true)
        })

        it('should call closeTrialFinishSetupModal when primary action is clicked', () => {
            const mockCloseTrialFinishSetupModal = jest.fn()
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                closeTrialFinishSetupModal: mockCloseTrialFinishSetupModal,
            } as unknown as UseShoppingAssistantTrialFlowReturn)

            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsShoppingAssistant),
            )

            result.current.primaryAction?.onClick()
            expect(mockCloseTrialFinishSetupModal).toHaveBeenCalledTimes(1)
        })

        it('should call closeTrialFinishSetupModal when onClose is called', () => {
            const mockCloseTrialFinishSetupModal = jest.fn()
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                closeTrialFinishSetupModal: mockCloseTrialFinishSetupModal,
            } as unknown as UseShoppingAssistantTrialFlowReturn)

            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsShoppingAssistant),
            )

            result.current.onClose()
            expect(mockCloseTrialFinishSetupModal).toHaveBeenCalledTimes(1)
        })

        it('should work without storeName', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal({
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: true,
                }),
            )

            const titleTree = create(
                result.current.title as React.ReactElement,
            ).toJSON()
            expect(titleTree).toEqual(expectedTitleTree)
            expect(result.current.primaryAction?.label).toBe('Finish setup')
        })

        describe('with feature flag enabled', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(true)
            })

            it('should return not-onboarded text when isOnboarded is false and feature flag is enabled', () => {
                const mockPropsNotOnboarded = {
                    ...mockPropsShoppingAssistant,
                    isOnboarded: false,
                }

                const { result } = renderHookWithRouter(() =>
                    useTrialFinishSetupModal(mockPropsNotOnboarded),
                )

                const expectedTitleTreeNotOnboarded = create(
                    <>
                        Ready. Set. Grow. <br />
                        Your 14-day trial starts <br />
                        after onboarding.
                    </>,
                ).toJSON()

                const modal = result.current
                const titleTree = create(
                    modal.title as React.ReactElement,
                ).toJSON()
                expect(titleTree).toEqual(expectedTitleTreeNotOnboarded)
                expect(modal.content).toBe(
                    'Get started in just a few simple steps and make the most of your trial. Don’t worry, you can adjust everything anytime in settings.',
                )
                expect(modal.primaryAction?.label).toBe('Get Started')
                expect(modal.features).toHaveLength(3)
                expect(modal.features[0].title).toBe(
                    'Select and configure channels',
                )
            })
        })

        describe('with feature flag disabled', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(false)
            })

            it('should return onboarded text when isOnboarded is false but feature flag is disabled', () => {
                const expectedTitleTreeOnboarded = create(
                    <>
                        Ready. Set. Grow. <br />
                        Your 14-day trial starts <br />
                        now.
                    </>,
                ).toJSON()

                const mockPropsNotOnboarded = {
                    ...mockPropsShoppingAssistant,
                    isOnboarded: false,
                }

                const { result } = renderHookWithRouter(() =>
                    useTrialFinishSetupModal(mockPropsNotOnboarded),
                )

                const modal = result.current
                const titleTree = create(
                    modal.title as React.ReactElement,
                ).toJSON()
                expect(titleTree).toEqual(expectedTitleTreeOnboarded)
                expect(modal.subtitle).toBe("Let's unlock its full potential.")
                expect(modal.content).toBe(
                    'Just two simple steps to increase conversions and make the most of your trial.',
                )
                expect(modal.primaryAction?.label).toBe('Finish setup')
                expect(modal.isOpen).toBe(false)
                expect(modal.onClose).toEqual(expect.any(Function))
                expect(modal.features).toHaveLength(3)
                expect(modal.features[0]).toEqual({
                    icon: 'check',
                    title: 'Shopping Assistant features are now live!',
                    description:
                        'All features are unlocked, so you can start seeing impact today.',
                    isCompleted: true,
                })
            })
        })
    })

    describe('AI Agent trial type', () => {
        it('should return correct modal props', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsAiAgent),
            )

            const modal = result.current
            const titleTree = create(modal.title as React.ReactElement).toJSON()
            expect(titleTree).toEqual(expectedTitleTree)
            expect(modal.subtitle).toBe("Let's unlock its full potential.")
            expect(modal.content).toBe(
                'Get started in just a few simple steps and make the most of your trial. Don’t worry, you can adjust everything anytime in settings.',
            )
            expect(modal.primaryAction?.label).toBe('Get Started')
            expect(modal.isOpen).toBe(false)
            expect(modal.onClose).toEqual(expect.any(Function))
            expect(modal.features).toHaveLength(3)
        })

        it('should return isOpen as true when modal is open', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                isTrialFinishSetupModalOpen: true,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsAiAgent),
            )

            expect(result.current.isOpen).toBe(true)
        })

        it('should call closeTrialFinishSetupModal when primary action is clicked', () => {
            const mockCloseTrialFinishSetupModal = jest.fn()
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                closeTrialFinishSetupModal: mockCloseTrialFinishSetupModal,
            } as unknown as UseShoppingAssistantTrialFlowReturn)

            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsAiAgent),
            )

            result.current.primaryAction?.onClick()
            expect(mockCloseTrialFinishSetupModal).toHaveBeenCalledTimes(1)
        })

        it('should call closeTrialFinishSetupModal when onClose is called', () => {
            const mockCloseTrialFinishSetupModal = jest.fn()
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                closeTrialFinishSetupModal: mockCloseTrialFinishSetupModal,
            } as unknown as UseShoppingAssistantTrialFlowReturn)

            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal(mockPropsAiAgent),
            )

            result.current.onClose()
            expect(mockCloseTrialFinishSetupModal).toHaveBeenCalledTimes(1)
        })

        it('should work without storeName', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialFinishSetupModal({
                    trialType: TrialType.AiAgent,
                    isOnboarded: undefined,
                }),
            )

            const titleTree = create(
                result.current.title as React.ReactElement,
            ).toJSON()
            expect(titleTree).toEqual(expectedTitleTree)
            expect(result.current.primaryAction?.label).toBe('Get Started')
        })
    })
})
