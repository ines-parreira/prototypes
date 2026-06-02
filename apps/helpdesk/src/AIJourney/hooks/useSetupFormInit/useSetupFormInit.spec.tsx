import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { OrderStatusEnum } from '@gorgias/convert-client'

import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'

import { useSetupFormInit } from './useSetupFormInit'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
    useFlagWithLoading: jest.fn(() => ({ value: false, isLoading: false })),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration',
    () => ({
        useAiJourneyStoreConfiguration: jest.fn(() => ({
            storeConfiguration: null,
            isLoading: false,
        })),
    }),
)

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockStore = configureMockStore([thunk])()

let capturedReset: jest.Mock
let capturedSetValue: jest.Mock

const InnerConsumer = () => {
    const methods = useForm<SetupFormValues>()
    capturedReset = jest.spyOn(methods, 'reset') as unknown as jest.Mock
    capturedSetValue = jest.spyOn(methods, 'setValue') as unknown as jest.Mock
    const { isFormReady } = useSetupFormInit({
        reset: methods.reset,
        setValue: methods.setValue,
    })
    return (
        <FormProvider {...methods}>
            <div data-testid="ready">{isFormReady ? 'ready' : 'not-ready'}</div>
        </FormProvider>
    )
}

const renderComponent = () =>
    render(
        <Provider store={mockStore}>
            <InnerConsumer />
        </Provider>,
    )

describe('useSetupFormInit', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        capturedReset = jest.fn()
        capturedSetValue = jest.fn()
    })

    it('should return isFormReady=false initially while journey data is loading', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: true,
            journeyData: undefined,
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('not-ready')
    })

    it('should set isFormReady=true when journey data is loaded with no configuration', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: { id: 'j-1', configuration: null },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('ready')
    })

    it('should call reset with journey configuration values when journeyParams exist', () => {
        const journeyConfig = {
            sms_sender_integration_id: 42,
            sms_sender_number: '+1555000',
            max_follow_up_messages: 2,
            follow_up_wait_minutes: 120,
            include_image: true,
            offer_discount: false,
            target_order_status: OrderStatusEnum.OrderFulfilled,
        }

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: journeyConfig,
                included_audience_list_ids: ['list-1'],
                excluded_audience_list_ids: [],
                message_instructions: 'Some instructions',
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(capturedReset).toHaveBeenCalledWith(
            expect.objectContaining({
                max_follow_up_messages: 2,
                follow_up_wait_minutes: 120,
                include_image: true,
                offer_discount: false,
            }),
        )
    })

    it('should load max_follow_up_messages 1:1 without shifting when there are no follow-ups', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: {
                    sms_sender_integration_id: 42,
                    max_follow_up_messages: 0,
                    follow_up_wait_minutes: 1440,
                },
                message_instructions: 'instructions',
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(capturedReset).toHaveBeenCalledWith(
            expect.objectContaining({
                max_follow_up_messages: 0,
            }),
        )
    })

    it('should setValue sms_sender_integration_id (preserving other defaults) when storeSettingsEnabled is true and no journeyParams', () => {
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
        mockUseFlag.mockReturnValue(true)

        const mockUseAiJourneyStoreConfiguration =
            require('AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration')
                .useAiJourneyStoreConfiguration as jest.Mock
        mockUseAiJourneyStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                sms_sender_integration_id: 99,
                sms_sender_number: '+15550001111',
            },
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: { id: 'j-1', configuration: null },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(capturedSetValue).toHaveBeenCalledWith(
            'sms_sender_integration_id',
            { id: 99, label: '+15550001111' },
        )
        expect(capturedReset).not.toHaveBeenCalled()
    })

    it('should not reset when store settings enabled but store config not yet loaded', () => {
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
        mockUseFlag.mockReturnValue(true)

        const mockUseAiJourneyStoreConfiguration =
            require('AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration')
                .useAiJourneyStoreConfiguration as jest.Mock
        mockUseAiJourneyStoreConfiguration.mockReturnValue({
            storeConfiguration: null,
            isLoading: true,
        })

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: { id: 'j-1', configuration: null },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('not-ready')
        expect(capturedReset).not.toHaveBeenCalled()
        expect(capturedSetValue).not.toHaveBeenCalled()
    })

    it('should set isFormReady when journeyParams has media_urls (hasCustomImage path)', () => {
        const journeyConfig = {
            sms_sender_integration_id: 42,
            sms_sender_number: '+1555000',
            max_follow_up_messages: 1,
            follow_up_wait_minutes: 60,
            include_image: true,
            offer_discount: false,
            media_urls: [
                {
                    url: 'https://example.com/image.jpg',
                    name: 'image.jpg',
                    content_type: 'image/jpeg',
                },
            ],
        }

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: journeyConfig,
                message_instructions: 'Test instructions',
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('ready')
    })

    it('should set isFormReady with all journey-level fields including campaignTitle and flowName', () => {
        const journeyConfig = {
            sms_sender_integration_id: 1,
            max_follow_up_messages: 0,
            follow_up_wait_minutes: 60,
            include_image: false,
            offer_discount: false,
            rcs_enabled: true,
        }

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: journeyConfig,
                campaign: { title: 'My Campaign' },
                name: 'My Flow Name',
                message_instructions: 'Some instructions',
                execution_mode_override: 'live',
                included_audience_list_ids: ['audience-1'],
                excluded_audience_list_ids: ['audience-2'],
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('ready')
    })

    it('should use fallback values for undefined optional fields in journeyParams', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: {
                    sms_sender_integration_id: 42,
                    sms_sender_number: '+1555000',
                },
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('ready')
    })

    it('should use storeConfiguration as sms_sender fallback when storeSettingsEnabled and journeyParams has no sender', () => {
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
        mockUseFlag.mockReturnValue(true)

        const mockUseAiJourneyStoreConfiguration =
            require('AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration')
                .useAiJourneyStoreConfiguration as jest.Mock
        mockUseAiJourneyStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                sms_sender_integration_id: 77,
                sms_sender_number: '+15559998888',
            },
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: {
                    max_follow_up_messages: 1,
                    follow_up_wait_minutes: 60,
                    include_image: false,
                    offer_discount: false,
                },
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('ready')
    })

    it('should handle all optional journey config fields when set to actual values', () => {
        const journeyConfig = {
            sms_sender_integration_id: 42,
            sms_sender_number: '+1555000',
            max_follow_up_messages: 2,
            follow_up_wait_minutes: 120,
            include_image: true,
            offer_discount: true,
            max_discount_percent: 20,
            discount_code_message_threshold: 3,
            target_order_status: 'fulfilled',
            post_purchase_wait_minutes: 60,
            wait_time_minutes: 30,
            cooldown_days: 15,
            inactive_days: 20,
        }

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: journeyConfig,
                included_audience_list_ids: ['list-1'],
                excluded_audience_list_ids: [],
                message_instructions: 'instructions',
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(screen.getByTestId('ready')).toHaveTextContent('ready')
    })

    it('should reset journeyName from journeyData.name', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: { sms_sender_integration_id: 1 },
                name: 'Post-purchase VIP',
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(capturedReset).toHaveBeenCalledWith(
            expect.objectContaining({
                journeyName: 'Post-purchase VIP',
            }),
        )
    })

    it('should reset journeyName to undefined when journeyData.name is absent', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: { sms_sender_integration_id: 1 },
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(capturedReset).toHaveBeenCalledWith(
            expect.objectContaining({
                journeyName: undefined,
            }),
        )
    })

    it('should reset timing_offset to 0 when journeyData has no timing_offset', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: { sms_sender_integration_id: 1 },
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(capturedReset).toHaveBeenCalledWith(
            expect.objectContaining({
                timing_offset: 0,
            }),
        )
    })

    it('should reset timing_offset from journeyData.timing_offset when present', () => {
        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: {
                id: 'j-1',
                configuration: { sms_sender_integration_id: 1 },
                timing_offset: 14,
            },
            currentIntegration: { id: 1 },
        })

        renderComponent()

        expect(capturedReset).toHaveBeenCalledWith(
            expect.objectContaining({
                timing_offset: 14,
            }),
        )
    })
})
