import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'
import { create } from 'react-test-renderer'

import useAppSelector from 'hooks/useAppSelector'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import {
    useShoppingAssistantTrialFlow,
    UseShoppingAssistantTrialFlowReturn,
} from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialFinishSetupModal } from 'pages/aiAgent/trial/hooks/useTrialFinishSetupModal'
import { renderHookWithRouter } from 'tests/renderHookWithRouter'

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('hooks/useAppSelector')

const mockUseShoppingAssistantTrialFlow = assumeMock(
    useShoppingAssistantTrialFlow,
)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseAppSelector = assumeMock(useAppSelector)

const defaultMockUseShoppingAssistantTrialFlow =
    getUseShoppingAssistantTrialFlowFixture()

describe('useTrialFinishSetupModal', () => {
    const mockStoreName = 'test-store'
    const mockPropsShoppingAssistant = {
        trialType: TrialType.ShoppingAssistant,
        storeName: mockStoreName,
    }
    const mockPropsAiAgent = {
        trialType: TrialType.AiAgent,
        storeName: mockStoreName,
    }
    const expectedTitleTree = create(
        <>
            Ready. Set. Grow. <br />
            Your 14-days trial starts <br />
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
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Shopping Assistant trial type', () => {
        it('should return correct modal props', () => {
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
                }),
            )

            const titleTree = create(
                result.current.title as React.ReactElement,
            ).toJSON()
            expect(titleTree).toEqual(expectedTitleTree)
            expect(result.current.primaryAction?.label).toBe('Finish setup')
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
                "Get started in just a few simple steps and make the most of your trial. Don't worry, you can adjust everything anytime in settings.",
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
                useTrialFinishSetupModal({ trialType: TrialType.AiAgent }),
            )

            const titleTree = create(
                result.current.title as React.ReactElement,
            ).toJSON()
            expect(titleTree).toEqual(expectedTitleTree)
            expect(result.current.primaryAction?.label).toBe('Get Started')
        })
    })
})
