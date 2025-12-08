import { renderHook } from '@testing-library/react'

import {
    OPEN_DELETE_DOCUMENT_MODAL,
    OPEN_DELETE_URL_MODAL,
    OPEN_SYNC_URL_MODAL,
    OPEN_SYNC_WEBSITE_MODAL,
} from 'pages/aiAgent/KnowledgeHub/constants'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

import {
    dispatchDocumentEvent,
    openDeleteDocumentModal,
    openDeleteUrlModal,
    openSyncStoreWebsiteModal,
    openUrlModal,
    useListenToDocumentEvent,
} from './utils'

describe('utils', () => {
    describe('dispatchDocumentEvent', () => {
        it('dispatches a custom event with the given name', () => {
            const eventName = 'TEST_EVENT'
            const listener = jest.fn()

            window.addEventListener(eventName, listener)
            dispatchDocumentEvent(eventName)

            expect(listener).toHaveBeenCalledTimes(1)
            window.removeEventListener(eventName, listener)
        })

        it('dispatches a custom event with detail', () => {
            const eventName = 'TEST_EVENT_WITH_DETAIL'
            const detail = { foo: 'bar', count: 42 }
            const listener = jest.fn()

            window.addEventListener(eventName, listener)
            dispatchDocumentEvent(eventName, detail)

            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: eventName,
                    detail,
                }),
            )
            window.removeEventListener(eventName, listener)
        })

        it('dispatches multiple events independently', () => {
            const event1Name = 'EVENT_1'
            const event2Name = 'EVENT_2'
            const listener1 = jest.fn()
            const listener2 = jest.fn()

            window.addEventListener(event1Name, listener1)
            window.addEventListener(event2Name, listener2)

            dispatchDocumentEvent(event1Name)

            expect(listener1).toHaveBeenCalledTimes(1)
            expect(listener2).not.toHaveBeenCalled()

            dispatchDocumentEvent(event2Name)

            expect(listener1).toHaveBeenCalledTimes(1)
            expect(listener2).toHaveBeenCalledTimes(1)

            window.removeEventListener(event1Name, listener1)
            window.removeEventListener(event2Name, listener2)
        })
    })

    describe('useListenToDocumentEvent', () => {
        it('adds event listener on mount', () => {
            const eventName = 'TEST_EVENT'
            const handler = jest.fn()

            renderHook(() => useListenToDocumentEvent(eventName, handler))

            dispatchDocumentEvent(eventName)

            expect(handler).toHaveBeenCalledTimes(1)
        })

        it('removes event listener on unmount', () => {
            const eventName = 'TEST_EVENT'
            const handler = jest.fn()

            const { unmount } = renderHook(() =>
                useListenToDocumentEvent(eventName, handler),
            )

            dispatchDocumentEvent(eventName)
            expect(handler).toHaveBeenCalledTimes(1)

            unmount()

            dispatchDocumentEvent(eventName)
            expect(handler).toHaveBeenCalledTimes(1)
        })

        it('updates handler when it changes', () => {
            const eventName = 'TEST_EVENT'
            const handler1 = jest.fn()
            const handler2 = jest.fn()

            const { rerender } = renderHook(
                ({ handler }) => useListenToDocumentEvent(eventName, handler),
                {
                    initialProps: { handler: handler1 },
                },
            )

            dispatchDocumentEvent(eventName)
            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).not.toHaveBeenCalled()

            rerender({ handler: handler2 })

            dispatchDocumentEvent(eventName)
            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).toHaveBeenCalledTimes(1)
        })

        it('updates event name when it changes', () => {
            const event1Name = 'EVENT_1'
            const event2Name = 'EVENT_2'
            const handler = jest.fn()

            const { rerender } = renderHook(
                ({ eventName }) => useListenToDocumentEvent(eventName, handler),
                {
                    initialProps: { eventName: event1Name },
                },
            )

            dispatchDocumentEvent(event1Name)
            expect(handler).toHaveBeenCalledTimes(1)

            rerender({ eventName: event2Name })

            dispatchDocumentEvent(event1Name)
            expect(handler).toHaveBeenCalledTimes(1)

            dispatchDocumentEvent(event2Name)
            expect(handler).toHaveBeenCalledTimes(2)
        })

        it('handles multiple listeners for the same event', () => {
            const eventName = 'TEST_EVENT'
            const handler1 = jest.fn()
            const handler2 = jest.fn()

            renderHook(() => useListenToDocumentEvent(eventName, handler1))
            renderHook(() => useListenToDocumentEvent(eventName, handler2))

            dispatchDocumentEvent(eventName)

            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).toHaveBeenCalledTimes(1)
        })

        it('passes event object to handler', () => {
            const eventName = 'TEST_EVENT'
            const detail = { test: 'value' }
            const handler = jest.fn()

            renderHook(() => useListenToDocumentEvent(eventName, handler))

            dispatchDocumentEvent(eventName, detail)

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: eventName,
                    detail,
                }),
            )
        })
    })

    describe('openUrlModal', () => {
        it('dispatches OPEN_SYNC_URL_MODAL event with selected folder data', () => {
            const selectedFolder = {
                id: 'url-123',
                title: 'Example URL',
                type: KnowledgeType.URL,
                source: 'https://example.com',
                itemCount: 5,
                lastUpdatedAt: '2024-01-15T10:00:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_SYNC_URL_MODAL, listener)
            openUrlModal(selectedFolder)

            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OPEN_SYNC_URL_MODAL,
                    detail: selectedFolder,
                }),
            )

            window.removeEventListener(OPEN_SYNC_URL_MODAL, listener)
        })

        it('includes all folder properties in the dispatched event', () => {
            const selectedFolder = {
                id: 'url-456',
                title: 'Another URL',
                type: KnowledgeType.URL,
                source: 'https://test.com',
                itemCount: 10,
                lastUpdatedAt: '2024-01-16T12:00:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_SYNC_URL_MODAL, listener)
            openUrlModal(selectedFolder)

            const event = listener.mock.calls[0][0] as CustomEvent
            expect(event.detail).toEqual(selectedFolder)
            expect(event.detail.id).toBe('url-456')
            expect(event.detail.title).toBe('Another URL')
            expect(event.detail.source).toBe('https://test.com')

            window.removeEventListener(OPEN_SYNC_URL_MODAL, listener)
        })
    })

    describe('openSyncStoreWebsiteModal', () => {
        it('dispatches OPEN_SYNC_WEBSITE_MODAL event without detail', () => {
            const listener = jest.fn()

            window.addEventListener(OPEN_SYNC_WEBSITE_MODAL, listener)
            openSyncStoreWebsiteModal()

            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OPEN_SYNC_WEBSITE_MODAL,
                }),
            )

            window.removeEventListener(OPEN_SYNC_WEBSITE_MODAL, listener)
        })

        it('can be called multiple times independently', () => {
            const listener = jest.fn()

            window.addEventListener(OPEN_SYNC_WEBSITE_MODAL, listener)

            openSyncStoreWebsiteModal()
            expect(listener).toHaveBeenCalledTimes(1)

            openSyncStoreWebsiteModal()
            expect(listener).toHaveBeenCalledTimes(2)

            openSyncStoreWebsiteModal()
            expect(listener).toHaveBeenCalledTimes(3)

            window.removeEventListener(OPEN_SYNC_WEBSITE_MODAL, listener)
        })
    })

    describe('openDeleteUrlModal', () => {
        it('dispatches OPEN_DELETE_URL_MODAL event with folder data', () => {
            const folderData = {
                id: 'url-789',
                title: 'URL to Delete',
                type: KnowledgeType.URL,
                source: 'https://delete-me.com',
                itemCount: 3,
                lastUpdatedAt: '2024-01-17T14:30:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_DELETE_URL_MODAL, listener)
            openDeleteUrlModal(folderData)

            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OPEN_DELETE_URL_MODAL,
                    detail: folderData,
                }),
            )

            window.removeEventListener(OPEN_DELETE_URL_MODAL, listener)
        })

        it('passes correct data structure to event listener', () => {
            const folderData = {
                id: 'document-123',
                title: 'Document to Delete',
                type: KnowledgeType.Document,
                source: 'report.pdf',
                itemCount: 1,
                lastUpdatedAt: '2024-01-18T09:00:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_DELETE_URL_MODAL, listener)
            openDeleteUrlModal(folderData)

            const event = listener.mock.calls[0][0] as CustomEvent
            expect(event.detail).toEqual(folderData)
            expect(event.detail.type).toBe(KnowledgeType.Document)

            window.removeEventListener(OPEN_DELETE_URL_MODAL, listener)
        })

        it('handles different knowledge types correctly', () => {
            const urlFolder = {
                id: 'url-1',
                title: 'URL Folder',
                type: KnowledgeType.URL,
                source: 'https://example.com',
                itemCount: 2,
                lastUpdatedAt: '2024-01-19T10:00:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_DELETE_URL_MODAL, listener)
            openDeleteUrlModal(urlFolder)

            const event = listener.mock.calls[0][0] as CustomEvent
            expect(event.detail.type).toBe(KnowledgeType.URL)

            window.removeEventListener(OPEN_DELETE_URL_MODAL, listener)
        })
    })

    describe('openDeleteDocumentModal', () => {
        it('dispatches OPEN_DELETE_DOCUMENT_MODAL event with document data', () => {
            const documentData = {
                id: 'document-123',
                title: 'Document to Delete',
                type: KnowledgeType.Document,
                source: 'report.pdf',
                itemCount: 1,
                lastUpdatedAt: '2024-01-20T10:00:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
            openDeleteDocumentModal(documentData)

            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OPEN_DELETE_DOCUMENT_MODAL,
                    detail: documentData,
                }),
            )

            window.removeEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
        })

        it('passes correct data structure to event listener', () => {
            const documentData = {
                id: 'document-456',
                title: 'Another Document',
                type: KnowledgeType.Document,
                source: 'presentation.pptx',
                itemCount: 1,
                lastUpdatedAt: '2024-01-21T11:30:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
            openDeleteDocumentModal(documentData)

            const event = listener.mock.calls[0][0] as CustomEvent
            expect(event.detail).toEqual(documentData)
            expect(event.detail.id).toBe('document-456')
            expect(event.detail.title).toBe('Another Document')
            expect(event.detail.source).toBe('presentation.pptx')

            window.removeEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
        })

        it('includes all document properties in the dispatched event', () => {
            const documentData = {
                id: 'document-789',
                title: 'Spreadsheet Document',
                type: KnowledgeType.Document,
                source: 'data.xlsx',
                itemCount: 1,
                lastUpdatedAt: '2024-01-22T15:45:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
            openDeleteDocumentModal(documentData)

            const event = listener.mock.calls[0][0] as CustomEvent
            expect(event.detail).toEqual(documentData)
            expect(event.detail.type).toBe(KnowledgeType.Document)
            expect(event.detail.itemCount).toBe(1)
            expect(event.detail.lastUpdatedAt).toBe('2024-01-22T15:45:00Z')

            window.removeEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
        })

        it('handles document type correctly', () => {
            const documentFolder = {
                id: 'doc-001',
                title: 'PDF Document',
                type: KnowledgeType.Document,
                source: 'manual.pdf',
                itemCount: 1,
                lastUpdatedAt: '2024-01-23T09:00:00Z',
            }
            const listener = jest.fn()

            window.addEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
            openDeleteDocumentModal(documentFolder)

            const event = listener.mock.calls[0][0] as CustomEvent
            expect(event.detail.type).toBe(KnowledgeType.Document)

            window.removeEventListener(OPEN_DELETE_DOCUMENT_MODAL, listener)
        })
    })
})
