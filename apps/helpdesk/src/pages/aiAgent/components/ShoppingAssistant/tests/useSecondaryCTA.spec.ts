import { renderHook } from '@testing-library/react'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import { useSecondaryCTA } from '../hooks/useSecondaryCTA'
import {
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import {
    logShoppingAssistantEvent,
    logShoppingAssistantInTrialEvent,
} from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logShoppingAssistantEvent: jest.fn(),
    logShoppingAssistantInTrialEvent: jest.fn(),
}))

const mockLogShoppingAssistantEvent = logShoppingAssistantEvent as jest.Mock
const mockLogShoppingAssistantInTrialEvent =
    logShoppingAssistantInTrialEvent as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

const createMockTrialFlow = (overrides = {}) => ({
    startTrial: jest.fn(),
    revampStartTrial: jest.fn(),
    isLoading: false,
    isTrialModalOpen: false,
    isTrialFinishSetupModalOpen: false,
    isSuccessModalOpen: false,
    isManageTrialModalOpen: false,
    isUpgradePlanModalOpen: false,
    isTrialRequestModalOpen: false,
    closeTrialUpgradeModal: jest.fn(),
    onDismissTrialUpgradeModal: jest.fn(),
    onDismissUpgradePlanModal: jest.fn(),
    closeSuccessModal: jest.fn(),
    closeManageTrialModal: jest.fn(),
    openTrialUpgradeModal: jest.fn(),
    onConfirmTrial: jest.fn(),
    openManageTrialModal: jest.fn(),
    openUpgradePlanModal: jest.fn(),
    closeUpgradePlanModal: jest.fn(),
    closeTrialFinishSetupModal: jest.fn(),
    openTrialFinishSetupModal: jest.fn(),
    openTrialRequestModal: jest.fn(),
    closeTrialRequestModal: jest.fn(),
    onRequestTrialExtension: jest.fn(),
    ...overrides,
})

const createMockTrialAccess = (overrides = {}) => ({
    canNotifyAdmin: false,
    canBookDemo: false,
    canSeeSystemBanner: false,
    canSeeTrialCTA: false,
    hasCurrentStoreTrialStarted: false,
    hasAnyTrialStarted: false,
    hasCurrentStoreTrialOptedOut: false,
    hasAnyTrialOptedOut: false,
    hasCurrentStoreTrialExpired: false,
    hasAnyTrialExpired: false,
    hasAnyTrialOptedIn: false,
    hasAnyTrialActive: false,
    isAdminUser: false,
    isLoading: false,
    ...overrides,
})

describe('useSecondaryCTA', () => {
    it('returns "Manage Trial" button for AdminTrialProgress variant when not opted out', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.AdminTrialProgress,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toEqual({
            label: 'Manage Trial',
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogShoppingAssistantInTrialEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.ManageTrial,
        )
        expect(trialFlow.openManageTrialModal).toHaveBeenCalled()
    })

    it('returns undefined for AdminTrialProgress variant when opted out', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialOptedOut: true,
            hasAnyTrialOptedOut: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.AdminTrialProgress,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns undefined for LeadTrialProgress variant', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.LeadTrialProgress,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns "Book a demo" button when user can notify admin and book demo', () => {
        const trialAccess = createMockTrialAccess({
            canNotifyAdmin: true,
            canBookDemo: true,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.AdminTrial,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toEqual({
            label: 'Book a demo',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
            target: '_blank',
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Demo,
        )
    })

    it('returns "Learn more" button as default', () => {
        const trialAccess = createMockTrialAccess({
            canNotifyAdmin: false,
            canBookDemo: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(PromoCardVariant.AdminDemo, trialAccess, trialFlow),
        )

        expect(result.current).toEqual({
            label: 'Learn more',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
            target: '_blank',
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Learn,
        )
    })
})
