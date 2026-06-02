import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { JourneyEditorSidePanel } from './JourneyEditorSidePanel'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(() => ({ push: jest.fn() })),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useAiJourneyStoreConfiguration: jest.fn(() => ({
        storeConfiguration: null,
        isLoading: false,
    })),
}))

jest.mock('AIJourney/formFields', () => ({
    AudienceSelect: ({ type }: { type: string }) => (
        <div>
            {type === 'include' ? 'Include audience' : 'Exclude audience'}
        </div>
    ),
    EnableDiscountCode: () => <div>EnableDiscountCode</div>,
    EnableRcs: () => <div>EnableRcs</div>,
    FollowUpWaitHours: () => <div>FollowUpWaitHours</div>,
    ImageUpload: () => <div>ImageUpload</div>,
    IncludeImage: () => <div>IncludeImage</div>,
    MaxDiscountCode: () => <div>MaxDiscountCode</div>,
    MessageWithDiscountCode: () => <div>MessageWithDiscountCode</div>,
    MinutesDelay: () => <div>MinutesDelay</div>,
    NumberOfMessages: () => <div>NumberOfMessages</div>,
    NumberOfFollowUps: () => <div>NumberOfFollowUps</div>,
    SenderPhoneNumber: () => <div>SenderPhoneNumber</div>,
    TargetOrderStatus: () => <div>TargetOrderStatus</div>,
}))

jest.mock(
    'AIJourney/components/KlaviyoPermissionBanner/KlaviyoPermissionBanner',
    () => ({
        KlaviyoPermissionBanner: () => null,
    }),
)

jest.mock('AIJourney/formFields/WaitingDays/WaitingDays', () => ({
    WaitingDays: ({ type }: { type: string }) => <div>{type}</div>,
}))

jest.mock('AIJourney/components/ExecutionModeCard/ExecutionModeCard', () => ({
    ExecutionModeCard: () => <div>ExecutionModeCard</div>,
}))

jest.mock('AIJourney/components/ImageDropzone/ImageDropzone', () => ({
    ImageDropzone: () => <div>ImageDropzone</div>,
}))

jest.mock(
    'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge',
    () => ({
        JourneyStateBadge: ({ state }: { state: string }) => <div>{state}</div>,
    }),
)

jest.mock(
    'AIJourney/components/StaticTimingContent/StaticTimingContent',
    () => ({
        StaticTimingContent: () => <div>StaticTimingContent</div>,
    }),
)

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockStore = configureMockStore([thunk])()

const Wrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode
    defaultValues?: Record<string, unknown>
}) => {
    const methods = useForm({
        defaultValues: {
            max_follow_up_messages: 0,
            offer_discount: false,
            include_image: false,
            uploaded_image_attachment: undefined,
            ...defaultValues,
        },
    })
    return (
        <Provider store={mockStore}>
            <FormProvider {...methods}>{children}</FormProvider>
        </Provider>
    )
}

const renderComponent = (
    defaultValues?: Record<string, unknown>,
    { isFormReady = true }: { isFormReady?: boolean } = {},
) =>
    render(<JourneyEditorSidePanel isFormReady={isFormReady} />, {
        wrapper: ({ children }) => (
            <Wrapper defaultValues={defaultValues}>{children}</Wrapper>
        ),
    })

describe('<JourneyEditorSidePanel />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
            },
            journeyType: JOURNEY_TYPES.WELCOME,
            currentIntegration: { id: 1 },
        })
    })

    it('should render the "Details" section heading', () => {
        renderComponent()

        expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should render StaticTimingContent for welcome flow', () => {
        renderComponent()

        expect(screen.getByText('StaticTimingContent')).toBeInTheDocument()
    })

    it('should render MinutesDelay for welcome flow', () => {
        renderComponent()

        expect(screen.getByText('MinutesDelay')).toBeInTheDocument()
    })

    it('should render a skeleton loading state when form is not ready', () => {
        renderComponent(undefined, { isFormReady: false })

        expect(screen.queryByText('SenderPhoneNumber')).not.toBeInTheDocument()
    })

    it('should render form fields when form is ready', () => {
        renderComponent()

        expect(screen.getByText('SenderPhoneNumber')).toBeInTheDocument()
    })

    it('should render the "Allow follow-ups" toggle', () => {
        renderComponent()

        expect(
            screen.getByRole('switch', { name: /allow follow-ups/i }),
        ).toBeInTheDocument()
    })

    it('should show follow-up sub-fields when follow-ups are enabled', async () => {
        renderComponent({ max_follow_up_messages: 2 })

        expect(screen.getByText('NumberOfFollowUps')).toBeInTheDocument()
        expect(screen.getByText('FollowUpWaitHours')).toBeInTheDocument()
    })

    it('should hide follow-up sub-fields when follow-ups are disabled', () => {
        renderComponent({ max_follow_up_messages: 0 })

        expect(screen.queryByText('NumberOfFollowUps')).not.toBeInTheDocument()
        expect(screen.queryByText('FollowUpWaitHours')).not.toBeInTheDocument()
    })

    it('should enable follow-ups when the toggle is switched on', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByRole('switch', { name: /allow follow-ups/i }),
            )
        })

        expect(screen.getByText('NumberOfFollowUps')).toBeInTheDocument()
    })

    it('should render the DiscountCodeCard toggle', () => {
        renderComponent()

        expect(screen.getByText('EnableDiscountCode')).toBeInTheDocument()
    })

    it('should show discount sub-fields when discount is enabled', () => {
        renderComponent({ offer_discount: true })

        expect(screen.getByText('MaxDiscountCode')).toBeInTheDocument()
    })

    it('should hide discount sub-fields when discount is disabled', () => {
        renderComponent({ offer_discount: false })

        expect(screen.queryByText('MaxDiscountCode')).not.toBeInTheDocument()
    })

    it('should render the collapse button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /collapse/i }),
        ).toBeInTheDocument()
    })

    it('should hide content area when collapse button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        expect(screen.getByText('Details')).toBeInTheDocument()

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /collapse/i }))
        })
        expect(screen.queryByText('Details')).not.toBeInTheDocument()
    })

    it('should show expand button after collapsing', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /collapse/i }))
        })
        expect(
            screen.getByRole('button', { name: /expand/i }),
        ).toBeInTheDocument()
    })

    describe('impersonation mode', () => {
        let originalImpersonated: typeof window.USER_IMPERSONATED

        beforeEach(() => {
            originalImpersonated = window.USER_IMPERSONATED
        })

        afterEach(() => {
            window.USER_IMPERSONATED = originalImpersonated
        })

        it('should render ExecutionModeCard when USER_IMPERSONATED is true', () => {
            window.USER_IMPERSONATED = true

            renderComponent()

            expect(screen.getByText('ExecutionModeCard')).toBeInTheDocument()
        })

        it('should not render ExecutionModeCard when USER_IMPERSONATED is not set', () => {
            renderComponent()

            expect(
                screen.queryByText('ExecutionModeCard'),
            ).not.toBeInTheDocument()
        })

        it('should render the RcsEnabledCard when RCS FF is enabled and USER_IMPERSONATED is true', () => {
            window.USER_IMPERSONATED = true
            const mockUseFlag = require('@repo/feature-flags')
                .useFlag as jest.Mock
            mockUseFlag.mockImplementation(
                (flag: string) =>
                    flag === 'linear.task_AIJOU-1526.enable-rcs-messages',
            )

            renderComponent()

            expect(screen.getByText('EnableRcs')).toBeInTheDocument()
        })

        it('should not render the RcsEnabledCard when RCS FF is enabled but USER_IMPERSONATED is not set', () => {
            const mockUseFlag = require('@repo/feature-flags')
                .useFlag as jest.Mock
            mockUseFlag.mockImplementation(
                (flag: string) =>
                    flag === 'linear.task_AIJOU-1526.enable-rcs-messages',
            )

            renderComponent()

            expect(screen.queryByText('EnableRcs')).not.toBeInTheDocument()
        })
    })

    describe('cart abandonment journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    state: JourneyStatusEnum.Draft,
                },
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                currentIntegration: { id: 1 },
            })
        })

        it('should render StaticTimingContent', () => {
            renderComponent()

            expect(screen.getByText('StaticTimingContent')).toBeInTheDocument()
        })

        it('should not render MinutesDelay', () => {
            renderComponent()

            expect(screen.queryByText('MinutesDelay')).not.toBeInTheDocument()
        })

        it('should not render WaitingDays fields', () => {
            renderComponent()

            expect(screen.queryByText('inactive-days')).not.toBeInTheDocument()
            expect(screen.queryByText('cooldown')).not.toBeInTheDocument()
        })
    })

    describe('session abandonment journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    state: JourneyStatusEnum.Draft,
                },
                journeyType: JOURNEY_TYPES.SESSION_ABANDONMENT,
                currentIntegration: { id: 1 },
            })
        })

        it('should render StaticTimingContent', () => {
            renderComponent()

            expect(screen.getByText('StaticTimingContent')).toBeInTheDocument()
        })

        it('should not render MinutesDelay', () => {
            renderComponent()

            expect(screen.queryByText('MinutesDelay')).not.toBeInTheDocument()
        })

        it('should not render WaitingDays fields', () => {
            renderComponent()

            expect(screen.queryByText('inactive-days')).not.toBeInTheDocument()
            expect(screen.queryByText('cooldown')).not.toBeInTheDocument()
        })
    })

    describe('win-back journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    state: JourneyStatusEnum.Draft,
                },
                journeyType: JOURNEY_TYPES.WIN_BACK,
                currentIntegration: { id: 1 },
            })
        })

        it('should render WaitingDays for inactive-days and cooldown', () => {
            renderComponent()

            expect(screen.getByText('inactive-days')).toBeInTheDocument()
            expect(screen.getByText('cooldown')).toBeInTheDocument()
        })
    })

    describe('campaign journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    campaign: { state: JourneyCampaignStateEnum.Draft },
                    included_audience_list_ids: [1],
                },
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                currentIntegration: { id: 1 },
            })
        })

        it('should render "Include custom image" toggle for campaigns', () => {
            renderComponent()

            expect(
                screen.getByRole('switch', { name: /include custom image/i }),
            ).toBeInTheDocument()
        })

        it('should not render "Include image" toggle for campaigns', () => {
            renderComponent()

            expect(
                screen.queryByRole('switch', { name: /^include image$/i }),
            ).not.toBeInTheDocument()
        })

        it('should render audience section for campaigns', () => {
            renderComponent()

            expect(screen.getByText('Include audience')).toBeInTheDocument()
            expect(screen.getByText('Exclude audience')).toBeInTheDocument()
        })

        it('should show ImageUpload when "Include custom image" toggle is enabled', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('switch', {
                        name: /include custom image/i,
                    }),
                )
            })
            expect(screen.getByText('ImageUpload')).toBeInTheDocument()
        })

        it('should hide ImageUpload when "Include custom image" toggle is disabled after being enabled', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('switch', {
                        name: /include custom image/i,
                    }),
                )
                await user.click(
                    screen.getByRole('switch', {
                        name: /include custom image/i,
                    }),
                )
            })
            expect(screen.queryByText('ImageUpload')).not.toBeInTheDocument()
        })
    })

    describe('post-purchase journey type', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    state: JourneyStatusEnum.Draft,
                },
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                currentIntegration: { id: 1 },
            })
        })

        it('should render TargetOrderStatus', () => {
            renderComponent()

            expect(screen.getByText('TargetOrderStatus')).toBeInTheDocument()
        })

        it('should render MinutesDelay', () => {
            renderComponent()

            expect(screen.getByText('MinutesDelay')).toBeInTheDocument()
        })

        it('should not render StaticTimingContent', () => {
            renderComponent()

            expect(
                screen.queryByText('StaticTimingContent'),
            ).not.toBeInTheDocument()
        })

        it('should not render WaitingDays fields', () => {
            renderComponent()

            expect(screen.queryByText('inactive-days')).not.toBeInTheDocument()
            expect(screen.queryByText('cooldown')).not.toBeInTheDocument()
        })
    })

    describe('non-campaign journey type', () => {
        it('should render the IncludeImage field for non-campaign, non-welcome flows', () => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    state: JourneyStatusEnum.Draft,
                },
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                currentIntegration: { id: 1 },
            })

            renderComponent()

            expect(screen.getByText('IncludeImage')).toBeInTheDocument()
        })

        it('should not render "Include custom image" toggle for non-campaign', () => {
            renderComponent()

            expect(
                screen.queryByRole('switch', { name: /include custom image/i }),
            ).not.toBeInTheDocument()
        })
    })
})
