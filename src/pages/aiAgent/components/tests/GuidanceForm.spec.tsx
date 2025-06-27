/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { mockStore } from 'utils/testing'

import { GuidanceForm } from '../GuidanceForm/GuidanceForm'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: () => ({
        isLoading: false,
        handleOnTriggerActivateAiAgentNotification: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: () => ({
        guidanceArticles: [],
        isLoadingAiGuidances: false,
        isLoadingGuidanceArticleList: false,
    }),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            guidance: '/guidance',
            test: '/test',
        },
    }),
}))

describe('GuidanceForm', () => {
    const defaultProps = {
        shopName: 'test-shop',
        availableActions: [],
        isLoading: false,
        actionType: 'create' as const,
        onSubmit: jest.fn(),
        sourceType: 'scratch' as const,
        helpCenterId: 1,
    }

    const renderWithProvider = (ui: React.ReactElement) => {
        return render(
            <Provider store={mockStore({})}>
                <MemoryRouter>{ui}</MemoryRouter>
            </Provider>,
        )
    }

    it('renders GuidanceEditor', () => {
        const { container } = renderWithProvider(
            <GuidanceForm {...defaultProps} />,
        )

        expect(
            container.querySelector('.rich-textarea-wrapper'),
        ).toBeInTheDocument()
    })

    it('passes correct props to GuidanceEditor', () => {
        const { container } = renderWithProvider(
            <GuidanceForm
                {...defaultProps}
                initialFields={{
                    name: 'Test Name',
                    content: 'Test Content',
                    isVisible: true,
                }}
            />,
        )

        const editor = container.querySelector('.rich-textarea-wrapper')
        expect(editor).toBeInTheDocument()

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('Test Content')
    })

    it('submits the form with correct values when using GuidanceEditor', () => {
        const onSubmit = jest.fn()

        const { getByLabelText, getByText } = renderWithProvider(
            <GuidanceForm
                {...defaultProps}
                onSubmit={onSubmit}
                initialFields={{
                    name: 'Initial Name',
                    content: 'Initial Content',
                    isVisible: true,
                }}
            />,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } })

        const submitButton = getByText('Create Guidance')
        fireEvent.click(submitButton)

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Updated Name',
                content: 'Initial Content',
                isVisible: true,
            }),
        )
    })

    it('handles visibility toggle correctly', () => {
        const { getByLabelText } = renderWithProvider(
            <GuidanceForm
                {...defaultProps}
                initialFields={{
                    name: 'Test Name',
                    content: 'Test Content',
                    isVisible: false,
                }}
            />,
        )

        const visibilityToggle = getByLabelText(/Available for AI Agent/i)
        expect(visibilityToggle).not.toBeChecked()

        fireEvent.click(visibilityToggle)

        expect(visibilityToggle).toBeChecked()
    })
})
