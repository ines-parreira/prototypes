import { render, screen } from '@testing-library/react'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { GeneralCard } from './GeneralCard'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneyCampaignImageEnabled: 'ai_journey_campaign_image_enabled',
        AiJourneyStoreSettingsEnabled: 'ai-journey-store-settings-enabled',
    },
    useFlag: jest.fn(),
}))
jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))
jest.mock('AIJourney/formFields', () => ({
    CampaignName: () => <div>CampaignName</div>,
    SenderPhoneNumber: () => <div>SenderPhoneNumber</div>,
    NumberOfMessages: () => <div>NumberOfMessages</div>,
    IncludeImage: () => <div>IncludeImage</div>,
    ImageUpload: () => <div>ImageUpload</div>,
}))

const mockUseFlag = jest.requireMock('@repo/feature-flags').useFlag
const mockUseJourneyContext = jest.requireMock(
    'AIJourney/providers',
).useJourneyContext

describe('<GeneralCard />', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseJourneyContext.mockReturnValue({
            journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
        })
    })

    describe('when isFormReady is false', () => {
        it('renders a skeleton instead of the card', () => {
            render(<GeneralCard isFormReady={false} />)

            expect(screen.queryByText('General')).not.toBeInTheDocument()
            expect(
                screen.queryByText('SenderPhoneNumber'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when isFormReady is true', () => {
        it('renders the General card header', () => {
            render(<GeneralCard isFormReady={true} />)

            expect(screen.getByText('General')).toBeInTheDocument()
        })

        describe('SenderPhoneNumber', () => {
            afterEach(() => {
                window.USER_IMPERSONATED = null
            })

            it('renders when AiJourneyStoreSettingsEnabled flag is off', () => {
                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.getByText('SenderPhoneNumber'),
                ).toBeInTheDocument()
            })

            it('does not render when AiJourneyStoreSettingsEnabled flag is on', () => {
                mockUseFlag.mockImplementation(
                    (key: string) =>
                        key === 'ai-journey-store-settings-enabled',
                )

                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('SenderPhoneNumber'),
                ).not.toBeInTheDocument()
            })

            it('renders when AiJourneyStoreSettingsEnabled flag is on and USER_IMPERSONATED is true', () => {
                window.USER_IMPERSONATED = true
                mockUseFlag.mockImplementation(
                    (key: string) =>
                        key === 'ai-journey-store-settings-enabled',
                )

                render(<GeneralCard isFormReady={true} />)

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

                render(<GeneralCard isFormReady={true} />)

                expect(screen.getByText('CampaignName')).toBeInTheDocument()
            })

            it('does not render when journey type is not CAMPAIGN', () => {
                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('CampaignName'),
                ).not.toBeInTheDocument()
            })
        })

        describe('NumberOfMessages', () => {
            it('renders when journey type is not CAMPAIGN', () => {
                render(<GeneralCard isFormReady={true} />)

                expect(screen.getByText('NumberOfMessages')).toBeInTheDocument()
            })

            it('does not render when journey type is CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('NumberOfMessages'),
                ).not.toBeInTheDocument()
            })
        })

        describe('IncludeImage', () => {
            it('should render when journey is not CAMPAIGN', () => {
                render(<GeneralCard isFormReady={true} />)

                expect(screen.getByText('IncludeImage')).toBeInTheDocument()
            })

            it('should not render when journey type is CAMPAIGN', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })

            it('should not render when journey type is WELCOME', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.WELCOME,
                })

                render(<GeneralCard isFormReady={true} />)

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

                render(<GeneralCard isFormReady={true} />)

                expect(screen.getByText('ImageUpload')).toBeInTheDocument()
            })
        })
    })
})
