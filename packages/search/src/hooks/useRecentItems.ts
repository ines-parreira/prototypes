import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { localForageManager } from '@repo/browser-storage'
import _debounce from 'lodash/debounce'
import _isEqual from 'lodash/isEqual'

type RecentItem = {
    id: number
}

const MAX_RECENT_ITEMS = 30
export function useRecentItems<T extends RecentItem>(
    tableName: string,
    maxItems: number = MAX_RECENT_ITEMS,
) {
    const previousItemRef = useRef<T>()
    const localForage = useMemo(
        () => localForageManager.getTable(tableName),
        [tableName],
    )
    const [items, setItems] = useState<T[]>([])
    const [isGettingItems, setIsGettingItems] = useState(true)

    const readItems = useCallback(async () => {
        setIsGettingItems(true)

        try {
            await localForage.ready()
            const allItems = await localForage.getItems()
            const indexedItems = Object.entries(allItems)
                .map(
                    ([key, value]) =>
                        [Number.parseInt(key, 10), value] as const,
                )
                .filter(([key]) => !Number.isNaN(key))
                .sort((a, b) => b[0] - a[0])

            const dedupedItems = indexedItems.reduce<T[]>(
                (items, [, value]) => {
                    const typedValue = value as T

                    if (items.some((item) => item.id === typedValue.id)) {
                        return items
                    }

                    items.push(typedValue)

                    return items
                },
                [],
            )

            setItems(dedupedItems)
        } finally {
            setIsGettingItems(false)
        }
    }, [localForage])

    const debouncedSetRecentItem = useMemo(
        () =>
            _debounce(async (item: T) => {
                if (_isEqual(previousItemRef.current, item)) {
                    return
                }

                await localForage.ready()
                const itemCount = await localForage.length()

                if (itemCount) {
                    const existingKey = (await localForage.iterate(
                        (value: T, key) => {
                            if (value.id === item.id) {
                                return key
                            }
                        },
                    )) as string | undefined

                    if (existingKey) {
                        if (previousItemRef.current?.id === item.id) {
                            await localForage.setItem(existingKey, item)
                            previousItemRef.current = item
                            await readItems()
                            return
                        }

                        await localForage.removeItem(existingKey)
                    } else if (itemCount >= maxItems) {
                        const keys = await localForage.keys()
                        const indexes = keys
                            .map((key) => Number.parseInt(key, 10))
                            .filter((key) => !Number.isNaN(key))
                            .sort((a, b) => b - a)

                        const itemKeysToRemove = indexes.slice(maxItems - 1)

                        if (itemKeysToRemove.length > 0) {
                            await localForage.removeItems(
                                itemKeysToRemove.map(String),
                            )
                        }
                    }
                }

                await localForage.setItem(Date.now().toString(), item)
                previousItemRef.current = item
                await readItems()
            }, Duration.millis(300)),
        [localForage, maxItems, readItems],
    )

    const setRecentItem = useCallback(
        (item: T) => {
            void debouncedSetRecentItem(item)
        },
        [debouncedSetRecentItem],
    )

    useEffect(() => {
        void readItems()
    }, [readItems])

    useEffect(() => {
        return () => {
            debouncedSetRecentItem.cancel()
        }
    }, [debouncedSetRecentItem])

    useEffect(() => {
        let subscription: Subscription | undefined

        async function setupSubscription() {
            await localForage.ready()
            subscription = localForageManager.observeTable(tableName, readItems)
        }

        void setupSubscription()

        return () => {
            subscription?.unsubscribe()
        }
    }, [localForage, readItems, tableName])

    return {
        items,
        isGettingItems,
        setRecentItem,
    }
}
