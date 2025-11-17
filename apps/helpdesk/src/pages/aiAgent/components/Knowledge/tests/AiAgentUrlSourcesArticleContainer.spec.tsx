import React from 'react'

import { render } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenter } from 'models/helpCenter/types'
import AiAgentUrlSourcesArticleContainer from 'pages/aiAgent/components/Knowledge/AiAgentUrlSourcesArticleContainer'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))

const useParamsMock = jest.mocked(useParams)
const useAppSelectorMock = jest.mocked(useAppSelector)
const useGetOrCreateSnippetHelpCenterMock = jest.mocked(
    useGetOrCreateSnippetHelpCenter,
)

const renderComponent = () => {
    return render(<AiAgentUrlSourcesArticleContainer />)
}

describe('AiAgentUrlSourcesArticleContainer', () => {
    it('renders null when helpCenter is not available', () => {
        useParamsMock.mockReturnValue({
            shopName: 'testShop',
            articleIngestionId: '123',
        })
        useAppSelectorMock.mockReturnValue({
            get: jest.fn(() => 'testDomain'),
        })
        useGetOrCreateSnippetHelpCenterMock.mockReturnValue({
            helpCenter: null,
            isLoading: false,
        })

        const { container } = renderComponent()
        expect(container.firstChild).toBeNull()
    })

    it('renders null when articleIngestionId is not available', () => {
        useParamsMock.mockReturnValue({
            shopName: 'testShop',
            articleIngestionId: undefined,
        })
        useAppSelectorMock.mockReturnValue({
            get: jest.fn(() => 'testDomain'),
        })
        useGetOrCreateSnippetHelpCenterMock.mockReturnValue({
            helpCenter: { id: 1 } as unknown as HelpCenter,
            isLoading: false,
        })

        const { container } = renderComponent()
        expect(container.firstChild).toBeNull()
    })
})
