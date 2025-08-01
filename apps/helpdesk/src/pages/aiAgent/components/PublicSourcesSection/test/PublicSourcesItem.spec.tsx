import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { PublicSourcesItem } from '../PublicSourcesItem'
import { SourceItem } from '../types'

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
    } as SourceItem,
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
                '/app/ai-agent/shopify/test/knowledge/sources/url-articles/1/articles',
                {
                    selectedResource: source,
                },
            )
        })
    })

    describe('deleteDisabled logic', () => {
        it('should disable delete button when source created less than 1 hour ago with loading status', () => {
            useFlagMock.mockReturnValue(false)
            const oneMinuteAgo = new Date()
            oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    createdDatetime: oneMinuteAgo.toISOString(),
                } as SourceItem,
            })

            const deleteButton = screen.getByRole('button', {
                name: 'Delete public URL',
            })
            expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable delete button when source created more than 1 hour ago with loading status', () => {
            useFlagMock.mockReturnValue(false)
            const twoHoursAgo = new Date()
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    createdDatetime: twoHoursAgo.toISOString(),
                } as SourceItem,
            })

            const deleteButton = screen.getByRole('button', {
                name: 'Delete public URL',
            })
            expect(deleteButton).not.toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable delete button for non-loading status regardless of creation time', () => {
            useFlagMock.mockReturnValue(false)
            const oneMinuteAgo = new Date()
            oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)

            const statuses = ['idle', 'done', 'error'] as const
            statuses.forEach((status) => {
                const { unmount } = renderComponent({
                    source: {
                        id: 1,
                        url: 'https://example.com',
                        status,
                        createdDatetime: oneMinuteAgo.toISOString(),
                    } as SourceItem,
                })

                const deleteButton = screen.getByRole('button', {
                    name: 'Delete public URL',
                })
                expect(deleteButton).toBeEnabled()
                unmount()
            })
        })

        it('should use latestSync date when available instead of createdDatetime', () => {
            useFlagMock.mockReturnValue(false)
            const twoHoursAgo = new Date()
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)
            const oneMinuteAgo = new Date()
            oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    createdDatetime: twoHoursAgo.toISOString(),
                    latestSync: oneMinuteAgo.toISOString(),
                } as SourceItem,
            })

            const deleteButton = screen.getByRole('button', {
                name: 'Delete public URL',
            })
            expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable delete button when latestSync is more than 1 hour ago', () => {
            useFlagMock.mockReturnValue(false)
            const threeHoursAgo = new Date()
            threeHoursAgo.setHours(threeHoursAgo.getHours() - 3)
            const twoHoursAgo = new Date()
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    createdDatetime: threeHoursAgo.toISOString(),
                    latestSync: twoHoursAgo.toISOString(),
                } as SourceItem,
            })

            const deleteButton = screen.getByRole('button', {
                name: 'Delete public URL',
            })
            expect(deleteButton).not.toHaveAttribute('aria-disabled', 'true')
        })
    })
})
