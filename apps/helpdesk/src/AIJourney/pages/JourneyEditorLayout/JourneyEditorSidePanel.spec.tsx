import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
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
    useSetupFormInit: jest.fn(() => ({
        isFormReady: true,
        storeSettingsEnabled: false,
    })),
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
            max_follow_up_messages: 1,
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

const renderComponent = (defaultValues?: Record<string, unknown>) =>
    render(<JourneyEditorSidePanel />, {
        wrapper: ({ children }) => (
            <Wrapper defaultValues={defaultValues}>{children}</Wrapper>
        ),
    })

const mockUseSetupFormInit = require('AIJourney/hooks')
    .useSetupFormInit as jest.Mock

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
        mockUseSetupFormInit.mockReturnValue({
            isFormReady: true,
            storeSettingsEnabled: false,
        })
    })

    it('should render the "Details" section heading', () => {
        renderComponent()

        expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should render a skeleton loading state when form is not ready', () => {
        const mockUseSetupFormInit = require('AIJourney/hooks')
            .useSetupFormInit as jest.Mock
        mockUseSetupFormInit.mockReturnValue({
            isFormReady: false,
            storeSettingsEnabled: false,
        })

        renderComponent()

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

        expect(screen.getByText('NumberOfMessages')).toBeInTheDocument()
        expect(screen.getByText('FollowUpWaitHours')).toBeInTheDocument()
    })

    it('should hide follow-up sub-fields when follow-ups are disabled', () => {
        renderComponent({ max_follow_up_messages: 1 })

        expect(screen.queryByText('NumberOfMessages')).not.toBeInTheDocument()
        expect(screen.queryByText('FollowUpWaitHours')).not.toBeInTheDocument()
    })

    it('should enable follow-ups when the toggle is switched on', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('switch', { name: /allow follow-ups/i }),
        )

        expect(screen.getByText('NumberOfMessages')).toBeInTheDocument()
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

        await user.click(screen.getByRole('button', { name: /collapse/i }))

        expect(screen.queryByText('Details')).not.toBeInTheDocument()
    })

    it('should show expand button after collapsing', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /collapse/i }))

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

            await user.click(
                screen.getByRole('switch', { name: /include custom image/i }),
            )

            expect(screen.getByText('ImageUpload')).toBeInTheDocument()
        })

        it('should hide ImageUpload when "Include custom image" toggle is disabled after being enabled', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('switch', { name: /include custom image/i }),
            )
            await user.click(
                screen.getByRole('switch', { name: /include custom image/i }),
            )

            expect(screen.queryByText('ImageUpload')).not.toBeInTheDocument()
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
