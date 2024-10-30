import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import React from 'react'

import {useSuggestCampaignCopy} from 'models/convert/campaign/queries'
import {DEFAULT_CAMPAIGN_NAME} from 'pages/convert/campaigns/constants/labels'
import {useIsAICopyAssistantEnabled} from 'pages/convert/common/hooks/useIsAICopyAssistantEnabled'

import {AICopyAssistant} from '../AICopyAssistant'

jest.mock('pages/convert/common/hooks/useIsAICopyAssistantEnabled')
jest.mock('models/convert/campaign/queries')

const mockGenerateSuggestions = jest.fn()

describe('AICopyAssistant', () => {
    const onApply = jest.fn()
    const defaultProps = {
        campaign: {
            name: 'Test Campaign',
            language: 'en',
            message_text: 'Test message',
        } as any,
        triggers: [],
        shopDomain: 'test-shop.myshopify.com',
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

    it('should call onRegenerateClick when Regenerate button is clicked', () => {
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Regenerate'))

        expect(mockGenerateSuggestions).toHaveBeenCalled()
    })

    it('should display suggestions when API call is successful', async () => {
        mockGenerateSuggestions.mockResolvedValue({
            data: {suggestions: ['Suggestion 1', 'Suggestion 2']},
        })
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Regenerate'))

        await waitFor(() => {
            expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
        })
    })

    it('should display error message when API call fails', async () => {
        mockGenerateSuggestions.mockRejectedValue(new Error('API Error'))
        render(<AICopyAssistant {...defaultProps} />)

        fireEvent.click(screen.getByText('Regenerate'))

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

        fireEvent.click(screen.getByText('Regenerate'))

        await waitFor(() => {
            fireEvent.click(screen.getByText('Apply'))
            expect(onApply).toHaveBeenCalledWith('Suggestion 1')
        })
    })

    it('should call onRegenerateClick on initial render if shouldGenerateInitialSuggestion is true', async () => {
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
})
