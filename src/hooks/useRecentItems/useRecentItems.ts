import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import _debounce from 'lodash/debounce'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'

import LocalForageManager from 'services/localForageManager/localForageManager'
import {DEBOUNCE_TIME, RecentItems} from 'hooks/useRecentItems/constants'
import useEffectOnce from 'hooks/useEffectOnce'
import useAsyncFn from 'hooks/useAsyncFn'

const MAX_RECENT_ITEMS = 30

const useRecentItems = <T extends {id: number}>(
    itemType: RecentItems,
    maxItems: number = MAX_RECENT_ITEMS
) => {
    const previousItemRef = useRef<T>()

    const localForage = useMemo(
        () => LocalForageManager.getTable(`recent-${itemType}`),
        [itemType]
    )

    const [items, setItems] = useState<T[]>([])

    const getRecentItems = useCallback(async () => {
        await localForage.ready()
        const allItems = await localForage.getItems()
        const indexedItems: [number, T][] = Object.entries(allItems).map(
            ([key, value]) => [parseInt(key), value]
        )
        indexedItems.sort((a, b) => b[0] - a[0])

        return indexedItems.map(([, value]) => value)
    }, [localForage])

    const [{loading: isGettingItems}, setRecentItems] = useAsyncFn(async () => {
        const recentItems = await getRecentItems()

        if (!_isEmpty(recentItems)) {
            setItems(recentItems)
        }
    }, [getRecentItems])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const setRecentItem = useCallback(
        _debounce(async (item: T) => {
            if (_isEqual(previousItemRef.current, item)) {
                return
            }

            await localForage.ready()
            const itemCount = await localForage.length()

            if (!!itemCount) {
                const existingItemKey = await localForage.iterate(
                    (value: T, key) => {
                        if (value.id === item.id) {
                            return key
                        }
                    }
                )

                if (!!existingItemKey) {
                    if (previousItemRef.current?.id === item.id) {
                        await localForage.setItem(existingItemKey, item)
                        previousItemRef.current = item
                        return
                    }

                    await localForage.removeItem(existingItemKey)
                } else if (itemCount >= maxItems) {
                    const keyIndexes = await localForage.keys()
                    const indexes = keyIndexes
                        .map((key) => parseInt(key))
                        .sort((a, b) => b - a)

                    const itemKeysToRemove = indexes.slice(maxItems - 1)
                    await localForage.removeItems(itemKeysToRemove.map(String))
                }
            }

            await localForage.setItem(Date.now().toString(), item)
            previousItemRef.current = item
        }, DEBOUNCE_TIME),
        [localForage, maxItems]
    )

    useEffectOnce(() => {
        void setRecentItems()
    })

    useEffect(() => {
        let subscription: Subscription | undefined
        const setupSubscription = async () => {
            await localForage.ready()
            subscription = LocalForageManager.observeTable(
                `recent-${itemType}`,
                setRecentItems
            )
        }

        void setupSubscription()

        return () => {
            subscription?.unsubscribe()
        }
    }, [itemType, localForage, setRecentItems])

    return useMemo(
        () => ({
            items,
            setRecentItem,
            isGettingItems,
        }),
        [items, setRecentItem, isGettingItems]
    )
}

export default useRecentItems
