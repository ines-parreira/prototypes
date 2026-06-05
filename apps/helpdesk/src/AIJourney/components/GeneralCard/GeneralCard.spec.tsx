import type { ReactNode } from 'react'

import userEvent from '@testing-library/user-event'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { GeneralCard } from './GeneralCard'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: ReactNode
        children: ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: ReactNode }) => (
        <div role="tooltip">{title}</div>
    ),
}))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneyCampaignImageEnabled: 'ai_journey_campaign_image_enabled',
        AiJourneyMultiInstanceFlows: 'ai-journey-multi-instance-flows',
    },
    useFlag: jest.fn(() => false),
}))
jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))
jest.mock('AIJourney/formFields', () => ({
    CampaignName: () => <div>CampaignName</div>,
    FlowName: () => <div>FlowName</div>,
    JourneyName: () => <div>JourneyName</div>,
    TimingOffset: () => <div>TimingOffset</div>,
    SenderPhoneNumber: () => <div>SenderPhoneNumber</div>,
    NumberOfMessages: () => <div>NumberOfMessages</div>,
    NumberOfFollowUps: () => <div>NumberOfFollowUps</div>,
    FollowUpWaitHours: () => <div>FollowUpWaitHours</div>,
    IncludeImage: () => <div>IncludeImage</div>,
    ImageUpload: () => <div>ImageUpload</div>,
}))

const mockUseFlag = jest.requireMock('@repo/feature-flags').useFlag
const mockUseJourneyContext = jest.requireMock(
    'AIJourney/providers',
).useJourneyContext

const renderCard = ({
    isFormReady = true,
    isV3Architecture = false,
    defaultValues = {},
}: {
    isFormReady?: boolean
    isV3Architecture?: boolean
    defaultValues?: Record<string, unknown>
} = {}) => {
    let capturedGetValues: (() => Record<string, unknown>) | undefined
    let capturedIsDirty = false

    const ValuesCaptor = () => {
        const { getValues, formState } = useFormContext()
        capturedGetValues = getValues
        capturedIsDirty = formState.isDirty
        return null
    }

    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <ValuesCaptor />
                <GeneralCard
                    isFormReady={isFormReady}
                    isV3Architecture={isV3Architecture}
                />
            </FormProvider>
        )
    }

    const result = render(<Wrapper />)
    return {
        ...result,
        getValues: () => capturedGetValues?.() ?? {},
        isDirty: () => capturedIsDirty,
    }
}

describe('<GeneralCard />', () => {
    beforeEach(() => {
        mockUseFlag.mockReset()
        mockUseFlag.mockReturnValue(false)
        delete (window as any).USER_IMPERSONATED
        mockUseJourneyContext.mockReturnValue({
            journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
        })
    })

    describe('when isFormReady is false', () => {
        it('renders a skeleton instead of the card', () => {
            renderCard({ isFormReady: false })

            expect(screen.queryByText('General')).not.toBeInTheDocument()
            expect(
                screen.queryByText('SenderPhoneNumber'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when isFormReady is true (legacy)', () => {
        it('renders the General card header', () => {
            renderCard()

            expect(screen.getByText('General')).toBeInTheDocument()
        })

        describe('SenderPhoneNumber', () => {
            it('renders SenderPhoneNumber', () => {
                renderCard()

                expect(
                    screen.getByText('SenderPhoneNumber'),
                ).toBeInTheDocument()
            })
        })

        describe('CampaignName', () => {
            it('renders when journey type is CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard()

                expect(screen.getByText('CampaignName')).toBeInTheDocument()
            })

            it('does not render when journey type is not CAMPAIGN', () => {
                renderCard()

                expect(
                    screen.queryByText('CampaignName'),
                ).not.toBeInTheDocument()
            })
        })

        describe('FlowName', () => {
            it('renders when journey type is CUSTOM', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CUSTOM,
                })

                renderCard()

                expect(screen.getByText('FlowName')).toBeInTheDocument()
            })

            it('does not render when journey type is not CUSTOM', () => {
                renderCard()

                expect(screen.queryByText('FlowName')).not.toBeInTheDocument()
            })

            it('does not render when journey type is CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard()

                expect(screen.queryByText('FlowName')).not.toBeInTheDocument()
            })
        })

        describe('JourneyName', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key: string) => key === 'ai-journey-multi-instance-flows',
                )
                window.USER_IMPERSONATED = true
            })

            it('renders for a standard journey type when FF is on and user is impersonated', () => {
                renderCard()

                expect(screen.getByText('JourneyName')).toBeInTheDocument()
            })

            it('does not render when FF is off', () => {
                mockUseFlag.mockReturnValue(false)
                renderCard()

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })

            it('does not render when user is not impersonated even with FF on', () => {
                delete (window as any).USER_IMPERSONATED
                renderCard()

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })

            it('does not render when journey type is CAMPAIGN even with FF on', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })
                renderCard()

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })

            it('does not render when journey type is CUSTOM even with FF on', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CUSTOM,
                })
                renderCard()

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })
        })

        describe('TimingOffset', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key: string) => key === 'ai-journey-multi-instance-flows',
                )
                window.USER_IMPERSONATED = true
            })

            it('renders for a standard journey type when FF is on and user is impersonated', () => {
                renderCard()

                expect(screen.getByText('TimingOffset')).toBeInTheDocument()
            })

            it('renders for CUSTOM journey type when FF is on and user is impersonated', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CUSTOM,
                })
                renderCard()

                expect(screen.getByText('TimingOffset')).toBeInTheDocument()
            })

            it('does not render when FF is off', () => {
                mockUseFlag.mockReturnValue(false)
                renderCard()

                expect(
                    screen.queryByText('TimingOffset'),
                ).not.toBeInTheDocument()
            })

            it('does not render when user is not impersonated even with FF on', () => {
                delete (window as any).USER_IMPERSONATED
                renderCard()

                expect(
                    screen.queryByText('TimingOffset'),
                ).not.toBeInTheDocument()
            })

            it('does not render when journey type is CAMPAIGN even with FF on', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })
                renderCard()

                expect(
                    screen.queryByText('TimingOffset'),
                ).not.toBeInTheDocument()
            })
        })

        describe('NumberOfMessages', () => {
            it('renders when journey type is not CAMPAIGN', () => {
                renderCard()

                expect(screen.getByText('NumberOfMessages')).toBeInTheDocument()
            })

            it('renders when journey type is CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard()

                expect(screen.getByText('NumberOfMessages')).toBeInTheDocument()
            })
        })

        describe('IncludeImage', () => {
            it('should render when journey is not CAMPAIGN', () => {
                renderCard()

                expect(screen.getByText('IncludeImage')).toBeInTheDocument()
            })

            it('should not render when journey type is CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard()

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })

            it('should not render when journey type is WELCOME', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.WELCOME,
                })

                renderCard()

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })

            it('should not render when journey type is WIN_BACK', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.WIN_BACK,
                })

                renderCard()

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })
        })

        describe('ImageUpload', () => {
            it('renders when journey type is CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard()

                expect(screen.getByText('ImageUpload')).toBeInTheDocument()
            })
        })
    })

    describe('when isV3Architecture is true', () => {
        it('renders a skeleton without the card content', () => {
            renderCard({ isFormReady: false, isV3Architecture: true })

            expect(screen.queryByText('General')).not.toBeInTheDocument()
            expect(
                screen.queryByText('SenderPhoneNumber'),
            ).not.toBeInTheDocument()
        })

        it('renders inline sections without the legacy General card header', () => {
            renderCard({ isV3Architecture: true })

            expect(screen.queryByText('General')).not.toBeInTheDocument()
            expect(screen.getByText('SenderPhoneNumber')).toBeInTheDocument()
            expect(screen.getByText('Allow follow-ups')).toBeInTheDocument()
        })

        describe('JourneyName (v3)', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key: string) => key === 'ai-journey-multi-instance-flows',
                )
                window.USER_IMPERSONATED = true
            })

            it('renders for a standard journey type when FF is on and user is impersonated', () => {
                renderCard({ isV3Architecture: true })

                expect(screen.getByText('JourneyName')).toBeInTheDocument()
            })

            it('does not render when FF is off', () => {
                mockUseFlag.mockReturnValue(false)
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })

            it('does not render when user is not impersonated even with FF on', () => {
                delete (window as any).USER_IMPERSONATED
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })

            it('does not render for CAMPAIGN even with FF on', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })

            it('does not render for CUSTOM even with FF on', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CUSTOM,
                })
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('JourneyName'),
                ).not.toBeInTheDocument()
            })
        })

        describe('TimingOffset (v3)', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key: string) => key === 'ai-journey-multi-instance-flows',
                )
                window.USER_IMPERSONATED = true
            })

            it('renders for a standard journey type when FF is on and user is impersonated', () => {
                renderCard({ isV3Architecture: true })

                expect(screen.getByText('TimingOffset')).toBeInTheDocument()
            })

            it('does not render when FF is off', () => {
                mockUseFlag.mockReturnValue(false)
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('TimingOffset'),
                ).not.toBeInTheDocument()
            })

            it('does not render when user is not impersonated even with FF on', () => {
                delete (window as any).USER_IMPERSONATED
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('TimingOffset'),
                ).not.toBeInTheDocument()
            })

            it('does not render for CAMPAIGN even with FF on', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('TimingOffset'),
                ).not.toBeInTheDocument()
            })
        })

        it('does not render CampaignName/FlowName (they are in the header for V3)', () => {
            mockUseJourneyContext.mockReturnValue({
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            renderCard({ isV3Architecture: true })

            expect(screen.queryByText('CampaignName')).not.toBeInTheDocument()
            expect(screen.queryByText('FlowName')).not.toBeInTheDocument()
        })

        describe('Allow follow-ups toggle', () => {
            it('renders the info tooltip with correct content', () => {
                renderCard({ isV3Architecture: true })

                expect(
                    screen.getByText(
                        "Nudge shoppers who didn't engage with the first message.",
                    ),
                ).toBeInTheDocument()
            })

            it('is off by default and does not render follow-up fields', () => {
                renderCard({ isV3Architecture: true })

                expect(
                    screen.getByRole('switch', { name: 'Allow follow-ups' }),
                ).not.toBeChecked()
                expect(
                    screen.queryByText('NumberOfFollowUps'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('FollowUpWaitHours'),
                ).not.toBeInTheDocument()
            })

            it('starts on and shows follow-up fields when max_follow_up_messages is greater than 0', () => {
                renderCard({
                    isV3Architecture: true,
                    defaultValues: { max_follow_up_messages: 2 },
                })

                expect(
                    screen.getByRole('switch', { name: 'Allow follow-ups' }),
                ).toBeChecked()
                expect(
                    screen.getByText('NumberOfFollowUps'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('FollowUpWaitHours'),
                ).toBeInTheDocument()
            })

            it('shows follow-up fields after toggling on and sets max_follow_up_messages to 1', async () => {
                const user = userEvent.setup()
                const { getValues } = renderCard({ isV3Architecture: true })

                await user.click(
                    screen.getByRole('switch', { name: 'Allow follow-ups' }),
                )

                expect(
                    screen.getByText('NumberOfFollowUps'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('FollowUpWaitHours'),
                ).toBeInTheDocument()
                expect(getValues().max_follow_up_messages).toBe(1)
            })

            it('hides follow-up fields after toggling off and sets max_follow_up_messages to 0', async () => {
                const user = userEvent.setup()
                const { getValues } = renderCard({
                    isV3Architecture: true,
                    defaultValues: { max_follow_up_messages: 2 },
                })

                await user.click(
                    screen.getByRole('switch', { name: 'Allow follow-ups' }),
                )

                expect(
                    screen.queryByText('NumberOfFollowUps'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('FollowUpWaitHours'),
                ).not.toBeInTheDocument()
                expect(getValues().max_follow_up_messages).toBe(0)
            })

            it('marks the form as dirty when toggling on', async () => {
                const user = userEvent.setup()
                const { isDirty } = renderCard({ isV3Architecture: true })

                expect(isDirty()).toBe(false)

                await user.click(
                    screen.getByRole('switch', { name: 'Allow follow-ups' }),
                )

                expect(isDirty()).toBe(true)
            })

            it('marks the form as dirty when toggling off', async () => {
                const user = userEvent.setup()
                const { isDirty } = renderCard({
                    isV3Architecture: true,
                    defaultValues: { max_follow_up_messages: 2 },
                })

                expect(isDirty()).toBe(false)

                await user.click(
                    screen.getByRole('switch', { name: 'Allow follow-ups' }),
                )

                expect(isDirty()).toBe(true)
            })
        })

        describe('IncludeImage', () => {
            it('renders for non-CAMPAIGN/non-WELCOME journey types', () => {
                renderCard({ isV3Architecture: true })

                expect(screen.getByText('IncludeImage')).toBeInTheDocument()
            })

            it('does not render for CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })

            it('does not render for WELCOME', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.WELCOME,
                })

                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })

            it('does not render for WIN_BACK', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.WIN_BACK,
                })

                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })
        })

        describe('Include custom image toggle', () => {
            it('shows the toggle for CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard({ isV3Architecture: true })

                expect(
                    screen.getByText('Include custom image'),
                ).toBeInTheDocument()
            })

            it('does not show the toggle for non-CAMPAIGN', () => {
                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('Include custom image'),
                ).not.toBeInTheDocument()
            })

            it('renders the info tooltip with correct content', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard({ isV3Architecture: true })

                expect(
                    screen.getByText(
                        "Upload an image to attach to your campaign's first message.",
                    ),
                ).toBeInTheDocument()
            })

            it('shows ImageUpload after toggling on', async () => {
                const user = userEvent.setup()
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard({ isV3Architecture: true })

                expect(
                    screen.queryByText('ImageUpload'),
                ).not.toBeInTheDocument()

                await user.click(
                    screen.getByRole('switch', {
                        name: 'Include custom image',
                    }),
                )

                expect(screen.getByText('ImageUpload')).toBeInTheDocument()
            })

            it('hides ImageUpload after toggling off', async () => {
                const user = userEvent.setup()
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard({ isV3Architecture: true })

                await user.click(
                    screen.getByRole('switch', {
                        name: 'Include custom image',
                    }),
                )
                await user.click(
                    screen.getByRole('switch', {
                        name: 'Include custom image',
                    }),
                )

                expect(
                    screen.queryByText('ImageUpload'),
                ).not.toBeInTheDocument()
            })

            it('starts ON when an image is already attached', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                renderCard({
                    isV3Architecture: true,
                    defaultValues: {
                        include_custom_image: true,
                        uploaded_image_attachment: [
                            {
                                url: 'https://example.com/image.jpg',
                                name: 'image.jpg',
                                content_type: 'image/jpeg',
                            },
                        ],
                    },
                })

                expect(
                    screen.getByRole('switch', {
                        name: 'Include custom image',
                    }),
                ).toBeChecked()
                expect(screen.getByText('ImageUpload')).toBeInTheDocument()
            })

            it('marks the form as dirty when toggling off, even without an uploaded image', async () => {
                const user = userEvent.setup()
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                const { isDirty } = renderCard({
                    isV3Architecture: true,
                    defaultValues: {
                        include_custom_image: true,
                    },
                })

                expect(isDirty()).toBe(false)

                await user.click(
                    screen.getByRole('switch', {
                        name: 'Include custom image',
                    }),
                )

                expect(isDirty()).toBe(true)
            })
        })
    })
})
