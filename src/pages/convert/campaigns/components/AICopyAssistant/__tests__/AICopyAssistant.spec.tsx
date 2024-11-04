import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import React from 'react'

import {logEvent} from 'common/segment'
import {useSuggestCampaignCopy} from 'models/convert/campaign/queries'
import {DEFAULT_CAMPAIGN_NAME} from 'pages/convert/campaigns/constants/labels'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {useIsAICopyAssistantEnabled} from 'pages/convert/common/hooks/useIsAICopyAssistantEnabled'

import {assumeMock} from 'utils/testing'

import {AICopyAssistant} from '../AICopyAssistant'

jest.mock('pages/convert/common/hooks/useIsAICopyAssistantEnabled')
jest.mock('models/convert/campaign/queries')
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ConvertApplySuggestionClicked: 'ConvertApplySuggestionClicked',
    },
}))

const logEventMock = assumeMock(logEvent)

const mockGenerateSuggestions = jest.fn()

describe('AICopyAssistant', () => {
    const onApply = jest.fn()
    const defaultProps = {
        campaign: {
            id: '2f712c6f-7215-4f67-a072-fe657bc51674',
            name: 'Test Campaign',
            language: 'en',
            message_text: 'Test message',
        } as Campaign,
        triggers: [],
        shopDomain: 'test-shop.myshopify.com',
        shopId: 123,
        isEnabled: true,
        shouldGenerateInitialSuggestion: false,
        onApply: onApply,
    }

    beforeEach(() => {
        ;(useIsAICopyAssistantEnabled as jest.Mock).mockReturnValue(true)
        ;(useSuggestCampaignCopy as jest.Mock).mockReturnValue({
            mutateAsync: mockGenerateSuggestions,
        })
    })

    it('should render AICopyAssistant when the flag is enabled', () => {
        render(<AICopyAssistant {...defaultProps} />)

        expect(
            screen.getByText('Uplift your message with AI Copy Assistant')
        ).toBeInTheDocument()
    })

    it('should not render AICopyAssistant when the flag is disabled', () => {
        ;(useIsAICopyAssistantEnabled as jest.Mock).mockReturnValue(false)

        render(<AICopyAssistant {...defaultProps} />)

        expect(
            screen.queryByText('Uplift your message with AI Copy Assistant')
        ).not.toBeInTheDocument()
    })

    it('should call onGenerateClick when Generate button is clicked', () => {
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Generate'))

        expect(mockGenerateSuggestions).toHaveBeenCalled()
    })

    it('should display suggestions when API call is successful', async () => {
        mockGenerateSuggestions.mockResolvedValue({
            data: {suggestions: ['Suggestion 1', 'Suggestion 2']},
        })
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Generate'))

        await waitFor(() => {
            expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
        })
    })

    it('should display error message when API call fails', async () => {
        mockGenerateSuggestions.mockRejectedValue(new Error('API Error'))
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Generate'))

        await waitFor(() => {
            expect(
                screen.getByText('Uplift your message with AI Copy Assistant')
            ).toBeInTheDocument()
            expect(screen.getByText('error')).toBeInTheDocument()
        })
    })

    it('should call onApply when Apply button is clicked', async () => {
        mockGenerateSuggestions.mockResolvedValue({
            data: {suggestions: ['Suggestion 1']},
        })
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Generate'))

        await waitFor(() => {
            fireEvent.click(screen.getByText('Apply'))
            expect(onApply).toHaveBeenCalledWith('Suggestion 1')
            expect(logEventMock).toHaveBeenCalledWith(
                'ConvertApplySuggestionClicked',
                {
                    shopId: 123,
                    campaignId: defaultProps.campaign.id,
                    context: expect.objectContaining({
                        title: defaultProps.campaign.name,
                    }),
                    suggestion: 'Suggestion 1',
                }
            )
        })
    })

    it('should call onGenerateClick on initial render if shouldGenerateInitialSuggestion is true', async () => {
        render(
            <AICopyAssistant
                {...defaultProps}
                shouldGenerateInitialSuggestion={true}
            />
        )
        await waitFor(() => {
            expect(mockGenerateSuggestions).toHaveBeenCalled()
            expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
        })
    })

    it('should pass empty campaign title if it is a default name', async () => {
        const props = {
            ...defaultProps,
            campaign: {
                ...defaultProps.campaign,
                name: DEFAULT_CAMPAIGN_NAME,
            },
            shouldGenerateInitialSuggestion: true,
        }

        render(<AICopyAssistant {...props} />)

        await waitFor(() => {
            expect(mockGenerateSuggestions).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    title: '',
                }),
            ])
        })
    })

    it('should display Regenerate label on follow-up calls', async () => {
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Generate'))

        expect(mockGenerateSuggestions).toHaveBeenCalled()

        await waitFor(() => {
            expect(screen.getByText('Regenerate')).toBeInTheDocument()
        })
    })

    it('should display Generating label on the first call', () => {
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Generate'))

        expect(mockGenerateSuggestions).toHaveBeenCalled()

        expect(screen.getByText('Generating')).toBeInTheDocument()
    })

    it('should display Generating label on follow-up calls', async () => {
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Generate'))

        expect(mockGenerateSuggestions).toHaveBeenCalled()

        await waitFor(() => {
            expect(screen.getByText('Regenerate')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Regenerate'))

        expect(screen.getByText('Regenerating')).toBeInTheDocument()
    })
})
