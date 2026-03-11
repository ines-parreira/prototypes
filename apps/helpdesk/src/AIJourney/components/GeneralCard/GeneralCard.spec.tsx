import { render, screen } from '@testing-library/react'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { GeneralCard } from './GeneralCard'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneySmsImagesEnabled: 'ai_journey_sms_images_enabled',
        AiJourneyCampaignImageEnabled: 'ai_journey_campaign_image_enabled',
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
            journeyType: JOURNEY_TYPES.WELCOME,
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

        it('always renders SenderPhoneNumber', () => {
            render(<GeneralCard isFormReady={true} />)

            expect(screen.getByText('SenderPhoneNumber')).toBeInTheDocument()
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
            it('renders when smsImagesEnabled flag is true and journey is not CAMPAIGN', () => {
                mockUseFlag.mockImplementation(
                    (key: string) => key === 'ai_journey_sms_images_enabled',
                )

                render(<GeneralCard isFormReady={true} />)

                expect(screen.getByText('IncludeImage')).toBeInTheDocument()
            })

            it('does not render when smsImagesEnabled flag is false', () => {
                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })

            it('does not render when journey type is CAMPAIGN even if smsImagesEnabled is true', () => {
                mockUseFlag.mockReturnValue(true)
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('IncludeImage'),
                ).not.toBeInTheDocument()
            })
        })

        describe('ImageUpload', () => {
            it('renders when journey type is CAMPAIGN and campaignImageEnabled flag is true', () => {
                mockUseFlag.mockImplementation(
                    (key: string) =>
                        key === 'ai_journey_campaign_image_enabled',
                )
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                render(<GeneralCard isFormReady={true} />)

                expect(screen.getByText('ImageUpload')).toBeInTheDocument()
            })

            it('does not render when campaignImageEnabled flag is false', () => {
                mockUseJourneyContext.mockReturnValue({
                    journeyType: JOURNEY_TYPES.CAMPAIGN,
                })

                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('ImageUpload'),
                ).not.toBeInTheDocument()
            })

            it('does not render when journey type is not CAMPAIGN even if campaignImageEnabled is true', () => {
                mockUseFlag.mockImplementation(
                    (key: string) =>
                        key === 'ai_journey_campaign_image_enabled',
                )

                render(<GeneralCard isFormReady={true} />)

                expect(
                    screen.queryByText('ImageUpload'),
                ).not.toBeInTheDocument()
            })
        })
    })
})
