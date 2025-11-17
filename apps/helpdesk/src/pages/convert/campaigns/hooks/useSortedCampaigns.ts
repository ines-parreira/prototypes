import { useCallback, useMemo, useState } from 'react'

import { history } from '@repo/routing'

import { useSearch } from 'hooks/useSearch'
import { opposite, OrderDirection } from 'models/api/types'

import type { Campaign } from '../types/Campaign'
import { isActiveStatus } from '../types/enums/CampaignStatus.enum'

function sortActiveFirst(campaigns: Campaign[]): Campaign[] {
    const _sortCreation = (a: Campaign, b: Campaign) => {
        // If the campaign is created before we added the created_datetime field, we put it at the end of the list
        if (!a.created_datetime) {
            return -1
        }

        // If the campaign is created before we added the created_datetime field, we put it at the end of the list
        if (!b.created_datetime) {
            return 1
        }

        if (a.created_datetime > b.created_datetime) {
            return -1
        }

        if (a.created_datetime < b.created_datetime) {
            return 1
        }

        return 0
    }

    return campaigns.sort((a, b) => {
        if (!isActiveStatus(a.status)) {
            if (!isActiveStatus(b.status)) {
                return _sortCreation(a, b)
            }
            return 1
        }

        if (!isActiveStatus(b.status)) {
            return -1
        }

        return _sortCreation(a, b)
    })
}

function sortByCreation(campaigns: Campaign[]): Campaign[] {
    return campaigns.sort((a, b) => {
        if (!a.created_datetime) {
            return 1
        }

        if (!b.created_datetime) {
            return -1
        }

        if (a.created_datetime > b.created_datetime) {
            return 1
        }

        if (a.created_datetime < b.created_datetime) {
            return -1
        }

        return 0
    })
}

function sortByName(campaigns: Campaign[]): Campaign[] {
    return campaigns.sort((a, b) => {
        const lowerCaseA = a.name.toLowerCase()
        const lowerCaseB = b.name.toLowerCase()

        if (lowerCaseA > lowerCaseB) {
            return 1
        }

        if (lowerCaseA < lowerCaseB) {
            return -1
        }
        return 0
    })
}

function sortBySchedule(campaigns: Campaign[]): Campaign[] {
    return campaigns.sort((a: Campaign, b: Campaign) => {
        if (!a.schedule) {
            return 1
        }

        if (!b.schedule) {
            return -1
        }

        const a_start_datetime = a.schedule.start_datetime
        const b_start_datetime = b.schedule.start_datetime
        if (a_start_datetime > b_start_datetime) {
            return 1
        }

        if (a_start_datetime < b_start_datetime) {
            return -1
        }

        return 0
    })
}

function updateSearchParams(params: Record<string, any>) {
    const currentParams = new URLSearchParams(location.search)

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            currentParams.set(key, value)
        } else {
            currentParams.delete(key)
        }
    })

    history.replace({
        search: currentParams.toString(),
    })
}

export type SortingKeys = 'created_datetime' | 'name' | 'schedule'

export function useSortedCampaigns(campaigns: Campaign[]) {
    const params = useSearch<{
        sortBy?: string
        sortDirection?: string
    }>()

    const [sortBy, setSortBy] = useState<SortingKeys>(
        (params.sortBy ?? undefined) as SortingKeys,
    )
    const [sortDirection, setSortDirection] = useState<OrderDirection>(
        (params.sortDirection as OrderDirection) ?? OrderDirection.Desc,
    )

    const changeSorting = useCallback(
        (sortingKey: SortingKeys) => {
            if (sortingKey === sortBy) {
                setSortDirection(opposite(sortDirection))

                updateSearchParams({
                    sortBy,
                    sortDirection: opposite(sortDirection),
                })

                return
            }

            setSortBy(sortingKey)
            setSortDirection(OrderDirection.Asc)

            updateSearchParams({
                sortBy: sortingKey,
                sortDirection: OrderDirection.Asc,
            })
        },
        [sortBy, sortDirection],
    )

    const sortedCampaigns = useMemo(() => {
        if (sortBy === 'created_datetime') {
            if (sortDirection === OrderDirection.Asc) {
                return sortByCreation(campaigns).reverse()
            }
            return sortByCreation(campaigns)
        }

        if (sortBy === 'name') {
            if (sortDirection === OrderDirection.Asc) {
                return sortByName(campaigns).reverse()
            }
            return sortByName(campaigns)
        }

        if (sortBy === 'schedule') {
            if (sortDirection === OrderDirection.Asc) {
                return sortBySchedule(campaigns).reverse()
            }
            return sortBySchedule(campaigns)
        }

        return sortActiveFirst(campaigns)
    }, [campaigns, sortBy, sortDirection])

    const api = useMemo(
        () => ({
            sortBy,
            sortDirection,
            sortedCampaigns,
            changeSorting,
        }),
        [changeSorting, sortBy, sortDirection, sortedCampaigns],
    )

    return api
}
