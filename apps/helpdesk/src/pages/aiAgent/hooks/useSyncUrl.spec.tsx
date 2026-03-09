import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, waitFor } from '@testing-library/react'

import {
    useGetIngestionLogs,
    useStartIngestion,
} from 'models/helpCenter/queries'
import * as errorsModule from 'utils/errors'

import { IngestionLogStatus } from '../AiAgentScrapedDomainContent/constant'
import * as utilsModule from '../AiAgentScrapedDomainContent/utils'
import {
    getUrlValidationError,
    hasAnchorTag,
    isUrlFromGorgiasHelpCenter,
    isUrlRoot,
    isUrlValid,
    isUrlWithDocumentExtension,
    useSyncUrl,
} from './useSyncUrl'

jest.mock('models/helpCenter/queries', () => ({
    helpCenterKeys: {
        articleIngestionLogs: jest.fn((id) => ['articleIngestionLogs', id]),
        articleIngestionLogsListRoot: jest.fn(() => [
            'articleIngestionLogsListRoot',
        ]),
    },
    useGetIngestionLogs: jest.fn(),
    useStartIngestion: jest.fn(),
}))

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

jest.mock('./useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            knowledge: '/test-shop/settings/ai-agent/knowledge',
        },
    })),
}))

describe('useSyncUrl', () => {
    describe('isUrlValid', () => {
        it('returns false for undefined', () => {
            expect(isUrlValid(undefined)).toBe(false)
        })

        it('returns false for empty string', () => {
            expect(isUrlValid('')).toBe(false)
        })

        it('returns false for invalid URL', () => {
            expect(isUrlValid('not a url')).toBe(false)
            expect(isUrlValid('just text')).toBe(false)
        })

        it('returns true for valid URL', () => {
            expect(isUrlValid('https://example.com')).toBe(true)
            expect(isUrlValid('http://example.com')).toBe(true)
        })

        it('returns true for various valid URL formats', () => {
            expect(isUrlValid('https://example.com/path')).toBe(true)
            expect(isUrlValid('https://example.com/path?query=1')).toBe(true)
            expect(isUrlValid('https://example.com/path#hash')).toBe(true)
            expect(isUrlValid('https://subdomain.example.com')).toBe(true)
        })
    })

    describe('isUrlRoot', () => {
        it('returns true for root URL with just domain', () => {
            expect(isUrlRoot('https://example.com')).toBe(true)
        })

        it('returns true for root URL with trailing slash', () => {
            expect(isUrlRoot('https://example.com/')).toBe(true)
        })

        it('returns false for URL with pathname', () => {
            expect(isUrlRoot('https://example.com/path')).toBe(false)
            expect(isUrlRoot('https://example.com/path/subpath')).toBe(false)
        })

        it('returns false for URL with query params', () => {
            expect(isUrlRoot('https://example.com?query=1')).toBe(false)
            expect(isUrlRoot('https://example.com/?query=1')).toBe(false)
        })

        it('returns false for URL with hash', () => {
            expect(isUrlRoot('https://example.com#hash')).toBe(false)
            expect(isUrlRoot('https://example.com/#hash')).toBe(false)
        })

        it('returns false for invalid URL', () => {
            expect(isUrlRoot('not a url')).toBe(false)
        })
    })

    describe('isUrlFromGorgiasHelpCenter', () => {
        it('returns true for .gorgias.help domain', () => {
            expect(
                isUrlFromGorgiasHelpCenter('https://store.gorgias.help', []),
            ).toBe(true)
            expect(
                isUrlFromGorgiasHelpCenter(
                    'https://subdomain.store.gorgias.help',
                    [],
                ),
            ).toBe(true)
        })

        it('returns true for subdomain.gorgias.help', () => {
            expect(
                isUrlFromGorgiasHelpCenter(
                    'https://my-store.gorgias.help/articles',
                    [],
                ),
            ).toBe(true)
        })

        it('returns true for custom domain in list', () => {
            const customDomains = ['help.example.com', 'support.example.com']
            expect(
                isUrlFromGorgiasHelpCenter(
                    'https://help.example.com',
                    customDomains,
                ),
            ).toBe(true)
            expect(
                isUrlFromGorgiasHelpCenter(
                    'https://support.example.com/article',
                    customDomains,
                ),
            ).toBe(true)
        })

        it('returns false for other domains', () => {
            expect(isUrlFromGorgiasHelpCenter('https://example.com', [])).toBe(
                false,
            )
            expect(isUrlFromGorgiasHelpCenter('https://google.com', [])).toBe(
                false,
            )
        })

        it('returns false when not in custom domains', () => {
            const customDomains = ['help.example.com']
            expect(
                isUrlFromGorgiasHelpCenter(
                    'https://other.example.com',
                    customDomains,
                ),
            ).toBe(false)
        })

        it('returns false for invalid URL', () => {
            expect(isUrlFromGorgiasHelpCenter('not a url', [])).toBe(false)
        })
    })

    describe('isUrlWithDocumentExtension', () => {
        it('returns true for PDF', () => {
            expect(
                isUrlWithDocumentExtension('https://example.com/doc.pdf'),
            ).toBe(true)
        })

        it('returns true for various document extensions', () => {
            expect(
                isUrlWithDocumentExtension('https://example.com/doc.doc'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/doc.docx'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/sheet.xls'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/sheet.xlsx'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/slide.ppt'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/slide.pptx'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/data.txt'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/data.csv'),
            ).toBe(true)
        })

        it('returns false for HTML/web pages', () => {
            expect(
                isUrlWithDocumentExtension('https://example.com/page.html'),
            ).toBe(false)
            expect(isUrlWithDocumentExtension('https://example.com/page')).toBe(
                false,
            )
        })

        it('returns false for invalid URL', () => {
            expect(isUrlWithDocumentExtension('not a url')).toBe(false)
        })

        it('returns false for URL without extension', () => {
            expect(isUrlWithDocumentExtension('https://example.com')).toBe(
                false,
            )
            expect(isUrlWithDocumentExtension('https://example.com/path')).toBe(
                false,
            )
        })

        it('is case insensitive', () => {
            expect(
                isUrlWithDocumentExtension('https://example.com/doc.PDF'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/doc.PdF'),
            ).toBe(true)
            expect(
                isUrlWithDocumentExtension('https://example.com/doc.DOCX'),
            ).toBe(true)
        })
    })

    describe('hasAnchorTag', () => {
        it('returns true for URL with hash', () => {
            expect(hasAnchorTag('https://example.com#section')).toBe(true)
            expect(hasAnchorTag('https://example.com/path#anchor')).toBe(true)
        })

        it('returns false for URL without hash', () => {
            expect(hasAnchorTag('https://example.com')).toBe(false)
            expect(hasAnchorTag('https://example.com/path')).toBe(false)
        })

        it('returns false for invalid URL', () => {
            expect(hasAnchorTag('not a url')).toBe(false)
        })

        it('returns false for URL with only hash character', () => {
            // URL with just '#' has empty hash property
            expect(hasAnchorTag('https://example.com/#')).toBe(false)
        })
    })

    describe('getUrlValidationError', () => {
        const mockExistingUrls = ['https://existing.com']
        const mockCustomDomains = ['help.example.com']

        it('returns error for empty URL', () => {
            expect(getUrlValidationError('', [], mockCustomDomains)).toBe(
                'URL is required',
            )
        })

        it('returns error for invalid URL', () => {
            expect(
                getUrlValidationError('not a url', [], mockCustomDomains),
            ).toBe('Invalid URL')
        })

        it('returns error for Gorgias Help Center URL', () => {
            expect(
                getUrlValidationError(
                    'https://store.gorgias.help/article',
                    [],
                    mockCustomDomains,
                ),
            ).toBe(
                'Help Center links are not supported. You can manage Help Center articles separately in Knowledge.',
            )
        })

        it('returns error for custom domain Help Center URL', () => {
            expect(
                getUrlValidationError(
                    'https://help.example.com/article',
                    [],
                    mockCustomDomains,
                ),
            ).toBe(
                'Help Center links are not supported. You can manage Help Center articles separately in Knowledge.',
            )
        })

        it('allows store domain URLs', () => {
            expect(
                getUrlValidationError(
                    'https://store.com/products',
                    [],
                    mockCustomDomains,
                ),
            ).toBeNull()
        })

        it('returns error for root URL', () => {
            expect(
                getUrlValidationError(
                    'https://example.com',
                    [],
                    mockCustomDomains,
                ),
            ).toBe('URL must include a subpage (ie. www.example.com/faqs)')
            expect(
                getUrlValidationError(
                    'https://example.com/',
                    [],
                    mockCustomDomains,
                ),
            ).toBe('URL must include a subpage (ie. www.example.com/faqs)')
        })

        it('returns error for duplicate URL', () => {
            const existingUrlsWithPath = ['https://existing.com/page']
            const mockExistingUrlLink =
                'http://localhost/knowledge/sources?filter=url&folder=https%3A%2F%2Fexisting.com%2Fpage'
            const result = getUrlValidationError(
                'https://existing.com/page',
                existingUrlsWithPath,
                mockCustomDomains,
                mockExistingUrlLink,
            )

            const { container } = render(<div>{result}</div>)
            expect(container.textContent).toContain(
                'This URL is already synced. To sync a new version, re-sync the',
            )
            expect(container.textContent).toContain('existing URL')

            const link = container.querySelector('a')
            expect(link).toHaveAttribute('href', mockExistingUrlLink)
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })

        it('returns error when limit reached', () => {
            const tenUrls = Array.from(
                { length: 10 },
                (_, i) => `https://url${i}.com`,
            )
            expect(
                getUrlValidationError(
                    'https://new.com/page',
                    tenUrls,
                    mockCustomDomains,
                ),
            ).toBe('Maximum 10 URLs allowed')
        })

        it('returns error for document extension', () => {
            expect(
                getUrlValidationError(
                    'https://example.com/doc.pdf',
                    [],
                    mockCustomDomains,
                ),
            ).toBe('URL cannot be a document')
            expect(
                getUrlValidationError(
                    'https://example.com/file.docx',
                    [],
                    mockCustomDomains,
                ),
            ).toBe('URL cannot be a document')
        })

        it('returns error for anchor tag', () => {
            expect(
                getUrlValidationError(
                    'https://example.com/page#section',
                    [],
                    mockCustomDomains,
                ),
            ).toBe(
                "URLs with # anchors aren't supported. We'll sync the full page content instead of just that section.",
            )
        })

        it('returns null for valid URL', () => {
            expect(
                getUrlValidationError(
                    'https://valid.com/page',
                    [],
                    mockCustomDomains,
                ),
            ).toBeNull()
        })

        it('validates in correct order - checks invalid before other validations', () => {
            expect(
                getUrlValidationError(
                    'not a url',
                    mockExistingUrls,
                    mockCustomDomains,
                ),
            ).toBe('Invalid URL')
        })

        it('validates in correct order - checks help center before other validations', () => {
            expect(
                getUrlValidationError(
                    'https://store.gorgias.help/article',
                    [],
                    mockCustomDomains,
                ),
            ).toBe(
                'Help Center links are not supported. You can manage Help Center articles separately in Knowledge.',
            )
        })
    })

    describe('useSyncUrl hook', () => {
        const mockHelpCenterId = 123
        const mockExistingUrls = ['https://existing.com']
        const mockCustomDomains = ['help.example.com']

        const mockIngestionLogs = [
            {
                id: 1,
                source: 'url' as const,
                status: IngestionLogStatus.Successful,
                created_at: '2024-01-15T10:00:00Z',
            },
            {
                id: 2,
                source: 'domain' as const,
                status: IngestionLogStatus.Successful,
                created_at: '2024-01-16T10:00:00Z',
            },
            {
                id: 3,
                source: 'url' as const,
                status: IngestionLogStatus.Pending,
                created_at: '2024-01-17T10:00:00Z',
            },
        ]

        const mockStartIngestion = jest.fn()
        const mockInvalidateQueries = jest.fn()

        const createWrapper = () => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: { retry: false },
                    mutations: { retry: false },
                },
            })
            queryClient.invalidateQueries = mockInvalidateQueries

            return ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            )
        }

        beforeEach(() => {
            jest.clearAllMocks()
            ;(useGetIngestionLogs as jest.Mock).mockReturnValue({
                data: mockIngestionLogs,
                error: null,
                isLoading: false,
            })
            ;(useStartIngestion as jest.Mock).mockReturnValue({
                mutateAsync: mockStartIngestion,
            })
            jest.spyOn(
                utilsModule,
                'getTheLatestIngestionLog',
            ).mockImplementation((logs) => logs?.[logs.length - 1])
        })

        it('filters and returns URL ingestion logs', () => {
            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current.urlIngestionLogs).toHaveLength(2)
            expect(result.current.urlIngestionLogs[0].source).toBe('url')
            expect(result.current.urlIngestionLogs[1].source).toBe('url')
        })

        it('returns latest URL ingestion log', () => {
            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current.latestUrlIngestionLog).toEqual(
                mockIngestionLogs[2],
            )
        })

        it('validateUrl returns error for invalid URL', () => {
            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            const error = result.current.validateUrl('not a url')
            expect(error).toBe('Invalid URL')
        })

        it('validateUrl returns null for valid URL', () => {
            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            const error = result.current.validateUrl('https://valid.com/page')
            expect(error).toBeNull()
        })

        it('syncUrl validates URL before syncing', async () => {
            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            await expect(result.current.syncUrl('not a url')).rejects.toThrow(
                'Invalid URL',
            )
        })

        it('syncUrl throws error for invalid URL without calling API', async () => {
            const existingUrlsWithPath = ['https://existing.com/page']
            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: existingUrlsWithPath,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            await expect(
                result.current.syncUrl('https://existing.com/page'),
            ).rejects.toThrow('Invalid URL')

            expect(mockStartIngestion).not.toHaveBeenCalled()
        })

        it('syncUrl calls startIngestion with correct params', async () => {
            mockStartIngestion.mockResolvedValue({})

            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.syncUrl('https://valid.com/page')
            })

            expect(mockStartIngestion).toHaveBeenCalledWith([
                undefined,
                { help_center_id: mockHelpCenterId },
                { url: 'https://valid.com/page', type: 'url' },
            ])
        })

        it('syncUrl calls startIngestion with correct params', async () => {
            mockStartIngestion.mockResolvedValue({})

            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.syncUrl('https://valid.com/page')
            })

            expect(mockStartIngestion).toHaveBeenCalledWith([
                undefined,
                { help_center_id: mockHelpCenterId },
                { url: 'https://valid.com/page', type: 'url' },
            ])
        })

        it('syncUrl reports error to Sentry on failure', async () => {
            const mockError = new Error('API Error')
            mockStartIngestion.mockRejectedValue(mockError)
            const reportErrorSpy = jest.spyOn(errorsModule, 'reportError')

            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            await expect(
                result.current.syncUrl('https://valid.com/page'),
            ).rejects.toThrow('API Error')

            expect(reportErrorSpy).toHaveBeenCalledWith(mockError, {
                tags: { team: 'convai-knowledge' },
                extra: {
                    context: 'Error during URL sync',
                    url: 'https://valid.com/page',
                },
            })
        })

        it('polling enabled when latest log is pending', () => {
            ;(useGetIngestionLogs as jest.Mock).mockReturnValue({
                data: mockIngestionLogs,
                error: null,
                isLoading: false,
            })

            renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            const callArgs = (useGetIngestionLogs as jest.Mock).mock.calls[0]
            const options = callArgs[1]

            // Call refetchInterval with mock data
            const refetchInterval = options.refetchInterval(mockIngestionLogs)
            expect(refetchInterval).toBe(60000) // POLLING_INTERVAL
        })

        it('polling disabled when latest log is not pending', () => {
            const completedLogs = [
                {
                    id: 1,
                    source: 'url' as const,
                    status: IngestionLogStatus.Successful,
                    created_at: '2024-01-15T10:00:00Z',
                },
            ]
            ;(useGetIngestionLogs as jest.Mock).mockReturnValue({
                data: completedLogs,
                error: null,
                isLoading: false,
            })

            renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            const callArgs = (useGetIngestionLogs as jest.Mock).mock.calls[0]
            const options = callArgs[1]

            // Call refetchInterval with completed logs
            const refetchInterval = options.refetchInterval(completedLogs)
            expect(refetchInterval).toBe(false)
        })

        it('returns loading state', () => {
            ;(useGetIngestionLogs as jest.Mock).mockReturnValue({
                data: undefined,
                error: null,
                isLoading: true,
            })

            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('returns error state', () => {
            const mockError = new Error('Fetch error')
            ;(useGetIngestionLogs as jest.Mock).mockReturnValue({
                data: undefined,
                error: mockError,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current.error).toBe(mockError)
        })

        it('query uses correct query key', () => {
            renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            expect(useGetIngestionLogs).toHaveBeenCalledWith(
                { help_center_id: mockHelpCenterId },
                expect.objectContaining({
                    queryKey: ['url-ingestion-logs', mockHelpCenterId],
                }),
            )
        })

        it('invalidates queries on success', async () => {
            mockStartIngestion.mockResolvedValue({})

            renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            // Get the onSuccess callback from useStartIngestion
            const onSuccessCallback = (useStartIngestion as jest.Mock).mock
                .calls[0][0].onSuccess

            await act(async () => {
                await onSuccessCallback()
            })

            await waitFor(() => {
                expect(mockInvalidateQueries).toHaveBeenCalledWith({
                    queryKey: ['articleIngestionLogs', mockHelpCenterId],
                })
                expect(mockInvalidateQueries).toHaveBeenCalledWith({
                    queryKey: ['articleIngestionLogsListRoot'],
                })
            })
        })

        it('handles empty ingestion logs', () => {
            ;(useGetIngestionLogs as jest.Mock).mockReturnValue({
                data: [],
                error: null,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current.urlIngestionLogs).toEqual([])
            expect(result.current.latestUrlIngestionLog).toBeUndefined()
        })

        it('handles undefined ingestion logs', () => {
            ;(useGetIngestionLogs as jest.Mock).mockReturnValue({
                data: undefined,
                error: null,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSyncUrl({
                        helpCenterId: mockHelpCenterId,
                        existingUrls: mockExistingUrls,
                        helpCenterCustomDomains: mockCustomDomains,
                        shopName: 'test-shop',
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current.urlIngestionLogs).toEqual([])
        })
    })
})
