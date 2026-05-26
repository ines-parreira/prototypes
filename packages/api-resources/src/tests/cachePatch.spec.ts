import type { InfiniteData } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

import {
    patchInfiniteListCache,
    removeFromInfiniteListCache,
} from '../cachePatch'

type TestItem = { id: number; name: string; archived?: boolean }

type TestPage = {
    data: {
        data: TestItem[]
        meta: { total_resources: number; next_cursor: string | null }
    }
}

const QUERY_KEY = ['items', 'listAllItems']

function createQueryClient() {
    return new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
}

function seedListCache(
    client: QueryClient,
    pages: TestPage[],
    queryKey: ReadonlyArray<unknown> = QUERY_KEY,
) {
    client.setQueryData<InfiniteData<TestPage>>(queryKey, {
        pageParams: pages.map(() => undefined),
        pages,
    })
}

function readListCache(
    client: QueryClient,
    queryKey: ReadonlyArray<unknown> = QUERY_KEY,
) {
    return client.getQueryData<InfiniteData<TestPage>>(queryKey)
}

describe('patchInfiniteListCache', () => {
    it('replaces matching items in every page', () => {
        const client = createQueryClient()
        seedListCache(client, [
            {
                data: {
                    data: [
                        { id: 1, name: 'Alice' },
                        { id: 2, name: 'Bob' },
                    ],
                    meta: { total_resources: 3, next_cursor: 'cursor-2' },
                },
            },
            {
                data: {
                    data: [{ id: 3, name: 'Carol' }],
                    meta: { total_resources: 3, next_cursor: null },
                },
            },
        ])

        patchInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: (item) => item.id === 2 || item.id === 3,
            patch: (existing) => ({ ...existing, archived: true }),
        })

        const cached = readListCache(client)
        expect(cached?.pages[0].data.data).toEqual([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob', archived: true },
        ])
        expect(cached?.pages[1].data.data).toEqual([
            { id: 3, name: 'Carol', archived: true },
        ])
        expect(cached?.pages[0].data.meta.total_resources).toBe(3)
    })

    it('preserves page references when nothing matches', () => {
        const client = createQueryClient()
        seedListCache(client, [
            {
                data: {
                    data: [{ id: 1, name: 'Alice' }],
                    meta: { total_resources: 1, next_cursor: null },
                },
            },
        ])

        const before = readListCache(client)

        patchInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: (item) => item.id === 99,
            patch: () => ({ id: 99, name: 'Nobody' }),
        })

        expect(readListCache(client)).toBe(before)
    })

    it('prepends insert to the first page and bumps total_resources when nothing matched', () => {
        const client = createQueryClient()
        seedListCache(client, [
            {
                data: {
                    data: [{ id: 1, name: 'Alice' }],
                    meta: { total_resources: 1, next_cursor: 'cursor-2' },
                },
            },
            {
                data: {
                    data: [{ id: 2, name: 'Bob' }],
                    meta: { total_resources: 1, next_cursor: null },
                },
            },
        ])

        patchInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: (item) => item.id === 99,
            patch: () => ({ id: 99, name: 'Nobody' }),
            insert: { id: 99, name: 'Charlie' },
        })

        const cached = readListCache(client)
        expect(cached?.pages[0].data.data).toEqual([
            { id: 99, name: 'Charlie' },
            { id: 1, name: 'Alice' },
        ])
        expect(cached?.pages[0].data.meta.total_resources).toBe(2)
        expect(cached?.pages[1].data.data).toEqual([{ id: 2, name: 'Bob' }])
        expect(cached?.pages[1].data.meta.total_resources).toBe(1)
    })

    it('does not insert when an existing match is patched', () => {
        const client = createQueryClient()
        seedListCache(client, [
            {
                data: {
                    data: [{ id: 1, name: 'Alice' }],
                    meta: { total_resources: 1, next_cursor: null },
                },
            },
        ])

        patchInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: (item) => item.id === 1,
            patch: () => ({ id: 1, name: 'Alice (renamed)' }),
            insert: { id: 1, name: 'Alice (insert)' },
        })

        const cached = readListCache(client)
        expect(cached?.pages[0].data.data).toEqual([
            { id: 1, name: 'Alice (renamed)' },
        ])
        expect(cached?.pages[0].data.meta.total_resources).toBe(1)
    })

    it('does nothing when the cache is empty', () => {
        const client = createQueryClient()

        patchInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: () => true,
            patch: (existing) => existing,
            insert: { id: 1, name: 'Alice' },
        })

        expect(readListCache(client)).toBeUndefined()
    })

    it('patches every cache that shares the queryKey prefix', () => {
        const client = createQueryClient()
        seedListCache(
            client,
            [
                {
                    data: {
                        data: [{ id: 1, name: 'Alice' }],
                        meta: { total_resources: 1, next_cursor: null },
                    },
                },
            ],
            ['items'],
        )
        seedListCache(
            client,
            [
                {
                    data: {
                        data: [{ id: 1, name: 'Alice' }],
                        meta: { total_resources: 1, next_cursor: null },
                    },
                },
            ],
            ['items', 'listAllItems', { archived: false }],
        )

        patchInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: ['items'],
            match: (item) => item.id === 1,
            patch: () => ({ id: 1, name: 'Alice (patched)' }),
        })

        expect(readListCache(client, ['items'])?.pages[0].data.data).toEqual([
            { id: 1, name: 'Alice (patched)' },
        ])
        expect(
            readListCache(client, [
                'items',
                'listAllItems',
                { archived: false },
            ])?.pages[0].data.data,
        ).toEqual([{ id: 1, name: 'Alice (patched)' }])
    })
})

describe('removeFromInfiniteListCache', () => {
    it('removes matching items from every page and decrements total_resources', () => {
        const client = createQueryClient()
        seedListCache(client, [
            {
                data: {
                    data: [
                        { id: 1, name: 'Alice' },
                        { id: 2, name: 'Bob' },
                    ],
                    meta: { total_resources: 3, next_cursor: 'cursor-2' },
                },
            },
            {
                data: {
                    data: [{ id: 3, name: 'Carol' }],
                    meta: { total_resources: 3, next_cursor: null },
                },
            },
        ])

        removeFromInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: (item) => item.id === 2 || item.id === 3,
        })

        const cached = readListCache(client)
        expect(cached?.pages[0].data.data).toEqual([{ id: 1, name: 'Alice' }])
        expect(cached?.pages[1].data.data).toEqual([])
        expect(cached?.pages[0].data.meta.total_resources).toBe(1)
    })

    it('preserves references when nothing matches', () => {
        const client = createQueryClient()
        seedListCache(client, [
            {
                data: {
                    data: [{ id: 1, name: 'Alice' }],
                    meta: { total_resources: 1, next_cursor: null },
                },
            },
        ])

        const before = readListCache(client)

        removeFromInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: (item) => item.id === 99,
        })

        expect(readListCache(client)).toBe(before)
    })

    it('does nothing when the cache is empty', () => {
        const client = createQueryClient()

        removeFromInfiniteListCache<TestItem>({
            queryClient: client,
            queryKey: QUERY_KEY,
            match: () => true,
        })

        expect(readListCache(client)).toBeUndefined()
    })
})
