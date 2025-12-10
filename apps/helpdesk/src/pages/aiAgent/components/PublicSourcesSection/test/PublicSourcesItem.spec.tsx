import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useParams } from 'react-router-dom'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { PublicSourcesItem } from '../PublicSourcesItem'
import type { SourceItem } from '../types'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)

const renderComponent = ({
    source = {
        id: 1,
        url: 'https://example.com',
        status: 'idle' as const,
        source: 'url' as const,
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
        it('should always show articles button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Open articles' }),
            ).toBeInTheDocument()
        })

        it('should navigate to url articles page with selectedResource in location state when Open articles button is clicked', () => {
            const source = {
                id: 1,
                url: 'https://example.com',
                status: 'idle' as const,
                source: 'url' as const,
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
            const oneMinuteAgo = new Date()
            oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    source: 'url',
                    createdDatetime: oneMinuteAgo.toISOString(),
                } as SourceItem,
            })

            const deleteButton = screen.getByRole('button', {
                name: 'Delete public URL',
            })
            expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable delete button when source created more than 1 hour ago with loading status', () => {
            const twoHoursAgo = new Date()
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    source: 'url',
                    createdDatetime: twoHoursAgo.toISOString(),
                } as SourceItem,
            })

            const deleteButton = screen.getByRole('button', {
                name: 'Delete public URL',
            })
            expect(deleteButton).not.toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable delete button for non-loading status regardless of creation time', () => {
            const oneMinuteAgo = new Date()
            oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)

            const statuses = ['idle', 'done', 'error'] as const
            statuses.forEach((status) => {
                const { unmount } = renderComponent({
                    source: {
                        id: 1,
                        url: 'https://example.com',
                        status,
                        source: 'url',
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
            const twoHoursAgo = new Date()
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)
            const oneMinuteAgo = new Date()
            oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    source: 'url',
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
            const threeHoursAgo = new Date()
            threeHoursAgo.setHours(threeHoursAgo.getHours() - 3)
            const twoHoursAgo = new Date()
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'loading',
                    source: 'url',
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

    describe('URL validation - anchor tags', () => {
        it('should show error when URL contains anchor tag', async () => {
            renderComponent({
                source: {
                    id: 1,
                    url: '',
                    status: 'idle',
                    source: 'url',
                    createdDatetime: '2024-01-01T00:00:00.000Z',
                } as SourceItem,
            })

            const input = screen.getByRole('textbox', { name: 'Public URL' })
            await userEvent.type(input, 'https://example.com/page#section')

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "URLs with # anchors aren't supported. We'll sync the full page content instead of just that section.",
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should disable sync button when URL contains anchor tag', async () => {
            renderComponent({
                source: {
                    id: 1,
                    url: '',
                    status: 'idle',
                    source: 'url',
                    createdDatetime: '2024-01-01T00:00:00.000Z',
                } as SourceItem,
            })

            const input = screen.getByRole('textbox', { name: 'Public URL' })
            await userEvent.type(input, 'https://example.com/page#section')

            await waitFor(() => {
                const syncButton = screen.getByRole('button', {
                    name: 'Sync URL',
                })
                expect(syncButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should not show error when URL does not contain anchor tag', async () => {
            renderComponent({
                source: {
                    id: 1,
                    url: '',
                    status: 'idle',
                    source: 'url',
                    createdDatetime: '2024-01-01T00:00:00.000Z',
                } as SourceItem,
            })

            const input = screen.getByRole('textbox', { name: 'Public URL' })
            await userEvent.type(input, 'https://example.com/page')

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        "URLs with # anchors aren't supported. We'll sync the full page content instead of just that section.",
                    ),
                ).not.toBeInTheDocument()
            })
        })

        it('should enable sync button when URL does not contain anchor tag', async () => {
            renderComponent({
                source: {
                    id: 1,
                    url: '',
                    status: 'idle',
                    source: 'url',
                    createdDatetime: '2024-01-01T00:00:00.000Z',
                } as SourceItem,
            })

            const input = screen.getByRole('textbox', { name: 'Public URL' })
            await userEvent.type(input, 'https://example.com/page')

            await waitFor(() => {
                const syncButton = screen.getByRole('button', {
                    name: 'Sync URL',
                })
                expect(syncButton).not.toHaveAttribute('aria-disabled', 'true')
            })
        })
    })

    describe('24-hour sync restriction', () => {
        it('should disable sync button when URL was synced less than 24h ago', () => {
            const recentSync = new Date()
            recentSync.setHours(recentSync.getHours() - 12) // 12 hours ago

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com',
                    status: 'idle',
                    createdDatetime: '2024-01-01T00:00:00.000Z',
                    latestSync: recentSync.toISOString(),
                } as SourceItem,
            })

            const syncButton = screen.getByRole('button', { name: 'Sync URL' })
            expect(syncButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable sync button when URL was synced more than 24h ago', () => {
            const oldSync = new Date()
            oldSync.setHours(oldSync.getHours() - 48) // 48 hours ago

            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com/page',
                    status: 'idle',
                    createdDatetime: '2024-01-01T00:00:00.000Z',
                    latestSync: oldSync.toISOString(),
                } as SourceItem,
            })

            const syncButton = screen.getByRole('button', { name: 'Sync URL' })
            expect(syncButton).not.toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable sync button when no latestSync is provided', () => {
            renderComponent({
                source: {
                    id: 1,
                    url: 'https://example.com/page',
                    status: 'idle',
                    createdDatetime: '2024-01-01T00:00:00.000Z',
                    latestSync: undefined,
                } as SourceItem,
            })

            const syncButton = screen.getByRole('button', { name: 'Sync URL' })
            expect(syncButton).not.toHaveAttribute('aria-disabled', 'true')
        })
    })
})
