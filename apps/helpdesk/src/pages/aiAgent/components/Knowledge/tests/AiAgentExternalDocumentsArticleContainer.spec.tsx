import React from 'react'

import { render } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenter } from 'models/helpCenter/types'
import AiAgentExternalDocumentsArticleContainer from 'pages/aiAgent/components/Knowledge/AiAgentExternalDocumentsArticleContainer'
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
    return render(<AiAgentExternalDocumentsArticleContainer />)
}

describe('AiAgentExternalDocumentsArticleContainer', () => {
    it('renders null when helpCenter is not available', () => {
        useParamsMock.mockReturnValue({
            shopName: 'testShop',
            fileIngestionId: '123',
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

    it('renders null when fileIngestionId is not available', () => {
        useParamsMock.mockReturnValue({
            shopName: 'testShop',
            fileIngestionId: undefined,
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
