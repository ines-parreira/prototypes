import { useCallback, useEffect, useState } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { reportError } from 'utils/errors'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import type { GroupedKnowledgeItem, KnowledgeType } from '../types'

/**
 * Safely decodes a URL parameter that may be encoded multiple times.
 * Falls back to the original value if decoding fails.
 *
 * @param encoded - The URL-encoded string to decode
 * @returns The fully decoded string, or the original value if decoding fails
 */
function safeDecodeUrlParameter(encoded: string): string {
    try {
        let decodedSource = encoded
        let previousValue = ''
        // Limit iterations to prevent infinite loops
        let iterations = 0
        const MAX_ITERATIONS = 10

        while (
            decodedSource.includes('%') &&
            decodedSource !== previousValue &&
            iterations < MAX_ITERATIONS
        ) {
            previousValue = decodedSource
            decodedSource = decodeURIComponent(decodedSource)
            iterations++
        }

        return decodedSource
    } catch (e) {
        // Report error with context for debugging
        reportError(
            e instanceof Error
                ? e
                : new Error('Failed to decode folder parameter'),
            {
                extra: {
                    original: encoded,
                    error: e instanceof Error ? e.message : String(e),
                },
            },
        )

        // Fallback to original encoded value - safer than using partial decode
        return encoded
    }
}

export function useKnowledgeHubUrlParams(
    shopName: string,
    tableData: GroupedKnowledgeItem[],
) {
    const history = useHistory()
    const location = useLocation()
    const { routes } = useAiAgentNavigation({ shopName })

    const [selectedFilter, setSelectedFilter] = useState<KnowledgeType | null>(
        () => {
            // Use lazy initializer to ensure we read from URL on mount
            const params = new URLSearchParams(location.search)
            const filterParam = params.get('filter')
            return filterParam as KnowledgeType | null
        },
    )
    const [selectedFolder, setSelectedFolder] =
        useState<GroupedKnowledgeItem | null>(() => {
            // Initialize from URL on mount (before tableData is loaded)
            const params = new URLSearchParams(location.search)
            const folderParam = params.get('folder')
            if (folderParam) {
                const decodedSource = safeDecodeUrlParameter(folderParam)

                // Create minimal folder object with source and title
                // Will be upgraded to full object by useEffect once tableData loads
                return {
                    source: decodedSource,
                    title: decodedSource,
                } as GroupedKnowledgeItem
            }
            return null
        })

    const [searchTerm, setSearchTerm] = useState<string>(() => {
        const params = new URLSearchParams(location.search)
        return params.get('search') || ''
    })

    const [dateRange, setDateRange] = useState<{
        startDate: string | null
        endDate: string | null
    }>(() => {
        const params = new URLSearchParams(location.search)
        return {
            startDate: params.get('startDate'),
            endDate: params.get('endDate'),
        }
    })

    const [inUseByAIFilter, setInUseByAIFilter] = useState<boolean | null>(
        () => {
            const params = new URLSearchParams(location.search)
            const value = params.get('inUseByAI')
            return value === 'true' ? true : value === 'false' ? false : null
        },
    )

    const buildUrlWithParams = useCallback(
        (basePath: string) => {
            const params = new URLSearchParams()
            if (selectedFilter) {
                params.set('filter', selectedFilter)
            }
            if (selectedFolder?.source) {
                params.set('folder', encodeURIComponent(selectedFolder.source))
            }
            if (searchTerm) {
                params.set('search', searchTerm)
            }
            if (dateRange.startDate) {
                params.set('startDate', dateRange.startDate)
            }
            if (dateRange.endDate) {
                params.set('endDate', dateRange.endDate)
            }
            if (inUseByAIFilter !== null) {
                params.set('inUseByAI', String(inUseByAIFilter))
            }
            const queryString = params.toString()
            return queryString ? `${basePath}?${queryString}` : basePath
        },
        [
            selectedFilter,
            selectedFolder,
            searchTerm,
            dateRange,
            inUseByAIFilter,
        ],
    )

    // Sync filter state with URL when URL changes
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const filterParam = params.get('filter') as KnowledgeType | null
        if (filterParam !== selectedFilter) {
            setSelectedFilter(filterParam)
        }
    }, [location.search, selectedFilter])

    // Sync folder state with URL when URL changes or tableData loads
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const folderParam = params.get('folder')
        const decodedFolder = folderParam
            ? safeDecodeUrlParameter(folderParam)
            : null

        // Clear folder if URL has no folder param
        if (!decodedFolder && selectedFolder) {
            setSelectedFolder(null)
            return
        }

        // Set or upgrade folder if URL has folder param
        if (decodedFolder) {
            // Find the full folder object in tableData
            const matchingFolder = tableData.find(
                (item) =>
                    item.source === decodedFolder &&
                    (item as GroupedKnowledgeItem).isGrouped,
            ) as GroupedKnowledgeItem | undefined

            if (matchingFolder) {
                // Upgrade to full folder object if we found it in tableData
                // or if the current folder is incomplete (missing title/type)
                if (
                    !selectedFolder ||
                    selectedFolder.source !== decodedFolder ||
                    !selectedFolder.title
                ) {
                    setSelectedFolder(matchingFolder)
                }
            } else if (
                !selectedFolder ||
                selectedFolder.source !== decodedFolder
            ) {
                // Fallback: create minimal folder object if not found in tableData
                setSelectedFolder({
                    source: decodedFolder,
                    title: decodedFolder,
                } as GroupedKnowledgeItem)
            }
        }
    }, [location.search, selectedFolder, tableData])

    // Sync search term with URL
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const searchParam = params.get('search') || ''
        if (searchParam !== searchTerm) {
            setSearchTerm(searchParam)
        }
    }, [location.search, searchTerm])

    // Sync date range with URL
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const startDate = params.get('startDate')
        const endDate = params.get('endDate')
        if (
            startDate !== dateRange.startDate ||
            endDate !== dateRange.endDate
        ) {
            setDateRange({ startDate, endDate })
        }
    }, [location.search, dateRange])

    // Sync AI filter with URL
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const value = params.get('inUseByAI')
        const paramValue =
            value === 'true' ? true : value === 'false' ? false : null
        if (paramValue !== inUseByAIFilter) {
            setInUseByAIFilter(paramValue)
        }
    }, [location.search, inUseByAIFilter])

    const handleDocumentFilterChange = useCallback(
        (value: KnowledgeType | null) => {
            const shouldClearFolder =
                selectedFolder && selectedFolder.type !== value
            if (shouldClearFolder) {
                setSelectedFolder(null)
            }
            setSelectedFilter(value)

            // Update URL with filter parameter and clear folder if needed
            const params = new URLSearchParams(location.search)
            if (value) {
                params.set('filter', value)
            } else {
                params.delete('filter')
            }
            if (shouldClearFolder) {
                params.delete('folder')
            }
            const newSearch = params.toString()
            const newUrl = newSearch
                ? `${history.location.pathname}?${newSearch}`
                : history.location.pathname
            history.replace(newUrl)
        },
        [selectedFolder, setSelectedFilter, history, location.search],
    )

    const updateUrlWithFolderParam = useCallback(
        (data: GroupedKnowledgeItem) => {
            // Update URL with folder parameter
            const params = new URLSearchParams(location.search)
            if (data.source) {
                params.set('folder', encodeURIComponent(data.source))
            }
            const newSearch = params.toString()
            const newUrl = newSearch
                ? `${history.location.pathname}?${newSearch}`
                : history.location.pathname
            history.replace(newUrl)
        },

        [history, location.search],
    )

    const removeFolderParamFromUrl = useCallback(() => {
        // Remove folder parameter from URL
        const params = new URLSearchParams(location.search)
        params.delete('folder')
        const newSearch = params.toString()
        const newUrl = newSearch
            ? `${history.location.pathname}?${newSearch}`
            : history.location.pathname
        history.replace(newUrl)
    }, [history, location.search])

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value)
            const params = new URLSearchParams(location.search)
            if (value) {
                params.set('search', value)
            } else {
                params.delete('search')
            }
            const newUrl = params.toString()
                ? `${history.location.pathname}?${params.toString()}`
                : history.location.pathname
            history.replace(newUrl)
        },
        [history, location.search],
    )

    const handleDateRangeChange = useCallback(
        (startDate: string | null, endDate: string | null) => {
            setDateRange({ startDate, endDate })
            const params = new URLSearchParams(location.search)
            if (startDate) {
                params.set('startDate', startDate)
            } else {
                params.delete('startDate')
            }
            if (endDate) {
                params.set('endDate', endDate)
            } else {
                params.delete('endDate')
            }
            const newUrl = params.toString()
                ? `${history.location.pathname}?${params.toString()}`
                : history.location.pathname
            history.replace(newUrl)
        },
        [history, location.search],
    )

    const handleInUseByAIChange = useCallback(
        (value: boolean | null) => {
            setInUseByAIFilter(value)
            const params = new URLSearchParams(location.search)
            if (value !== null) {
                params.set('inUseByAI', String(value))
            } else {
                params.delete('inUseByAI')
            }
            const newUrl = params.toString()
                ? `${history.location.pathname}?${params.toString()}`
                : history.location.pathname
            history.replace(newUrl)
        },
        [history, location.search],
    )

    const handleCloseEditorPath = useCallback(() => {
        const basePath = routes.knowledgeSources
        const targetPath = buildUrlWithParams(basePath)
        history.push(targetPath)
    }, [routes.knowledgeSources, history])

    return {
        selectedFilter,
        setSelectedFilter,
        selectedFolder,
        setSelectedFolder,
        searchTerm,
        setSearchTerm: handleSearchChange,
        dateRange,
        setDateRange: handleDateRangeChange,
        inUseByAIFilter,
        setInUseByAIFilter: handleInUseByAIChange,
        buildUrlWithParams,
        handleDocumentFilterChange,
        updateUrlWithFolderParam,
        removeFolderParamFromUrl,
        handleCloseEditorPath,
    }
}
