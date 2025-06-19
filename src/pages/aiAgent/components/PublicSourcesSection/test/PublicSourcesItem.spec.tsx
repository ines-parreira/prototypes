import React from 'react'

import { screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import { PublicSourcesItem } from '../PublicSourcesItem'

jest.mock('core/flags')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)
const useFlagMock = assumeMock(useFlag)

const renderComponent = ({
    source = {
        id: 1,
        url: 'https://example.com',
        status: 'idle' as const,
        createdDatetime: '2024-01-01T00:00:00.000Z',
    },
    onDelete = jest.fn(),
    onSync = jest.fn(),
    existingUrls = [],
    helpCenterCustomDomains = [],
    setIsPristine = jest.fn(),
    syncUrlOnCommand = false,
    setSyncUrlOnCommand = jest.fn(),
} = {}) => {
    return renderWithStoreAndQueryClientAndRouter(
        <PublicSourcesItem
            source={source}
            onDelete={onDelete}
            onSync={onSync}
            existingUrls={existingUrls}
            helpCenterCustomDomains={helpCenterCustomDomains}
            setIsPristine={setIsPristine}
            syncUrlOnCommand={syncUrlOnCommand}
            setSyncUrlOnCommand={setSyncUrlOnCommand}
        />,
    )
}

describe('PublicSourcesItem', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({ shopName: 'test' })
    })
    describe('Articles button visibility', () => {
        it('should not show articles button when feature flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Open articles' }),
            ).not.toBeInTheDocument()
        })

        it('should show articles button when feature flag is enabled', () => {
            useFlagMock.mockReturnValue(true)

            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Open articles' }),
            ).toBeInTheDocument()
        })

        it('should navigate to url articles page with selectedResource in location state when Open articles button is clicked', () => {
            useFlagMock.mockReturnValue(true)

            const source = {
                id: 1,
                url: 'https://example.com',
                status: 'idle' as const,
                createdDatetime: '2024-01-01T00:00:00.000Z',
                articleIds: [1, 2, 3],
            }
            const { history } = renderComponent({ source })

            jest.spyOn(history, 'push')

            const openArticlesButton = screen.getByLabelText('Open articles')
            openArticlesButton.click()

            expect(history.push).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test/knowledge/sources/url-articles/1',
                {
                    selectedResource: source,
                },
            )
        })
    })
})
