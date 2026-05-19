import type { ReactNode } from 'react'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { GeneralCard } from './GeneralCard'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneyCampaignImageEnabled: 'ai_journey_campaign_image_enabled',
        AiJourneyStoreSettingsEnabled: 'ai-journey-store-settings-enabled',
    },
    useFlag: jest.fn(() => false),
}))
jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))
jest.mock('AIJourney/formFields', () => ({
    CampaignName: () => <div>CampaignName</div>,
    FlowName: () => <div>FlowName</div>,
    SenderPhoneNumber: () => <div>SenderPhoneNumber</div>,
    NumberOfMessages: () => <div>NumberOfMessages</div>,
    FollowUpWaitHours: () => <div>FollowUpWaitHours</div>,
    IncludeImage: () => <div>IncludeImage</div>,
    ImageUpload: () => <div>ImageUpload</div>,
}))

const mockUseFlag = jest.requireMock('@repo/feature-flags').useFlag
const mockUseJourneyContext = jest.requireMock(
    'AIJourney/providers',
).useJourneyContext

const FormWrapper = ({ children }: { children: ReactNode }) => {
    const methods = useForm()
    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderCard = ({
    isFormReady = true,
    isV3Architecture = false,
}: {
    isFormReady?: boolean
    isV3Architecture?: boolean
} = {}) =>
    render(
        <FormWrapper>
            <GeneralCard
                isFormReady={isFormReady}
                isV3Architecture={isV3Architecture}
            />
        </FormWrapper>,
    )

describe('<GeneralCard />', () => {
    beforeEach(() => {
        mockUseFlag.mockReset()
        mockUseFlag.mockReturnValue(false)
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
            it('renders when AiJourneyStoreSettingsEnabled flag is off', () => {
                renderCard()

                expect(
                    screen.getByText('SenderPhoneNumber'),
                ).toBeInTheDocument()
            })

            it('renders when AiJourneyStoreSettingsEnabled flag is on', () => {
                mockUseFlag.mockImplementation(
                    (key: string) =>
                        key === 'ai-journey-store-settings-enabled',
                )

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
        it('renders inline sections without the legacy General card header', () => {
            renderCard({ isV3Architecture: true })

            expect(screen.queryByText('General')).not.toBeInTheDocument()
            expect(screen.getByText('SenderPhoneNumber')).toBeInTheDocument()
            expect(screen.getByText('Allow follow-ups')).toBeInTheDocument()
        })

        it('does not render CampaignName/FlowName (they are in the header for V3)', () => {
            mockUseJourneyContext.mockReturnValue({
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            renderCard({ isV3Architecture: true })

            expect(screen.queryByText('CampaignName')).not.toBeInTheDocument()
            expect(screen.queryByText('FlowName')).not.toBeInTheDocument()
        })

        it('shows "Include custom image" toggle for CAMPAIGN', () => {
            mockUseJourneyContext.mockReturnValue({
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            renderCard({ isV3Architecture: true })

            expect(screen.getByText('Include custom image')).toBeInTheDocument()
        })
    })
})
