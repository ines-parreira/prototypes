import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { useNotify } from 'hooks/useNotify'
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

/**
 * Determines if the current URL path represents viewing an article/snippet.
 *
 * Article URLs follow the pattern: /base/path/:knowledgeType/:articleId
 * For example: /ai-agent/knowledge-sources/help-center/article-123
 *
 * This checks that:
 * - Path has at least 3 segments (base path + type + id)
 * - The second-to-last segment exists (knowledge type)
 * - The last segment exists (article/snippet id)
 *
 * @param pathname - The URL pathname to check
 * @returns True if viewing an individual article, false otherwise
 */
function isViewingArticleUrl(pathname: string): boolean {
    const pathParts = pathname.split('/')
    return (
        pathParts.length >= 3 &&
        !!pathParts[pathParts.length - 2] &&
        !!pathParts[pathParts.length - 1]
    )
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

    const { error: notifyError } = useNotify()
    const hasShownFolderNotFoundError = useRef(false)

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

    const removeFolderParamFromUrl = useCallback(() => {
        // Remove folder parameter from URL
        const params = new URLSearchParams(location.search)
        params.delete('folder')
        const newSearch = params.toString()
        const newUrl = newSearch
            ? `${history.location.pathname}?${newSearch}`
            : history.location.pathname
        history.push(newUrl)
    }, [history, location.search])

    // Memoize folder object creation from URL to avoid unnecessary recalculations
    const folderObjectFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search)
        const folderParam = params.get('folder')
        const decodedFolder = folderParam
            ? safeDecodeUrlParameter(folderParam)
            : null

        if (!decodedFolder) {
            return null
        }

        const matchingItems = tableData.filter(
            (item) => item.source === decodedFolder,
        )

        if (matchingItems.length === 0) {
            // If tableData has loaded but no matching items found, the folder is invalid/deleted
            if (tableData.length > 0) {
                const isViewingArticle = isViewingArticleUrl(location.pathname)

                // Only show error notification when NOT viewing an article/snippet
                // When viewing an article, silently clear folder param to avoid double error messages
                if (!isViewingArticle && !hasShownFolderNotFoundError.current) {
                    notifyError(
                        'This folder is no longer available. It may have been deleted.',
                    )
                    hasShownFolderNotFoundError.current = true
                }

                // Always clear invalid folder param from URL
                removeFolderParamFromUrl()
                return null
            }

            // Create minimal folder object when tableData hasn't loaded yet
            // This happens during initialization before tableData loads
            return {
                source: decodedFolder,
                title: decodedFolder,
            } as GroupedKnowledgeItem
        }

        const sortedItems = [...matchingItems].sort(
            (a, b) =>
                new Date(b.lastUpdatedAt || 0).getTime() -
                new Date(a.lastUpdatedAt || 0).getTime(),
        )
        const mostRecentItem = sortedItems[0]

        return {
            ...mostRecentItem,
            title: mostRecentItem.isGrouped
                ? mostRecentItem.title
                : decodedFolder,
            isGrouped: true,
            itemCount: matchingItems.length,
        } as GroupedKnowledgeItem
    }, [
        location.search,
        tableData,
        location.pathname,
        notifyError,
        removeFolderParamFromUrl,
    ])

    // Reset error tracking when folder param changes or is cleared
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const folderParam = params.get('folder')

        // Reset error tracking when folder param is removed
        if (!folderParam) {
            hasShownFolderNotFoundError.current = false
            return
        }

        // Reset error tracking when a valid folder is found
        if (folderObjectFromUrl && folderObjectFromUrl.type) {
            hasShownFolderNotFoundError.current = false
        }
    }, [location.search, folderObjectFromUrl])

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
        const isViewingArticle = isViewingArticleUrl(location.pathname)

        // Clear folder if URL has no folder param
        // This includes when viewing an article with deleted folder (folder param was removed)
        if (!folderObjectFromUrl && selectedFolder) {
            setSelectedFolder(null)
            return
        }

        // Set or upgrade folder if URL has folder param and we have a valid folder object
        if (folderObjectFromUrl) {
            const decodedFolder = folderObjectFromUrl.source

            // When viewing an article, only upgrade if selectedFolder is missing required properties
            // Don't change selectedFolder if it already has the correct folder
            if (isViewingArticle) {
                // Only upgrade if selectedFolder is missing required properties
                if (
                    selectedFolder &&
                    selectedFolder.source === decodedFolder &&
                    selectedFolder.type &&
                    selectedFolder.lastUpdatedAt
                ) {
                    // selectedFolder already has full data, don't update
                    return
                }
            }

            // Upgrade to full folder object only if:
            // 1. No folder is selected, OR
            // 2. Different folder source, OR
            // 3. Current folder lacks type but new folder has it (upgrade from minimal to full)
            const shouldUpgrade =
                !selectedFolder ||
                selectedFolder.source !== decodedFolder ||
                (!selectedFolder.type && folderObjectFromUrl.type)

            if (shouldUpgrade) {
                setSelectedFolder(folderObjectFromUrl)
            }
        }
    }, [
        location.search,
        selectedFolder,
        tableData,
        location.pathname,
        folderObjectFromUrl,
    ])

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
            history.push(newUrl)
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
            history.push(newUrl)
        },

        [history, location.search],
    )

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
            history.push(newUrl)
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
            history.push(newUrl)
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
            history.push(newUrl)
        },
        [history, location.search],
    )

    const handleCloseEditorPath = useCallback(() => {
        const basePath = routes.knowledgeSources
        const targetPath = buildUrlWithParams(basePath)
        history.push(targetPath)
    }, [routes.knowledgeSources, history, buildUrlWithParams])

    const clearSearchParams = useCallback(() => {
        // Clear React state
        setSearchTerm('')
        setDateRange({
            startDate: null,
            endDate: null,
        })
        setInUseByAIFilter(null)

        // Update URL - remove search params while preserving filter/folder
        const params = new URLSearchParams(location.search)
        params.delete('search')
        params.delete('startDate')
        params.delete('endDate')
        params.delete('inUseByAI')

        const newSearch = params.toString()
        const newUrl = newSearch
            ? `${history.location.pathname}?${newSearch}`
            : history.location.pathname
        history.push(newUrl)
    }, [history, location.search])

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
        clearSearchParams,
    }
}
