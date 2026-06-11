import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { toast } from '@gorgias/axiom'

import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useCurrentHelpCenter } from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useMigrationApi } from 'pages/settings/helpCenter/hooks/useMigrationApi'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { getMigrationClient } from 'rest_api/migration_api'

import { HelpCenterImportCsvColumnMatchingView } from './HelpCenterImportCsvColumnMatchingView'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
jest.mock('pages/settings/helpCenter/hooks/useMigrationApi')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
jest.mock('pages/settings/helpCenter/providers/SupportedLocales')

jest.mock('@repo/api-resources/gorgiasAppsAuth', () => ({
    GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
        getAccessToken: jest.fn().mockResolvedValue('Bearer mock-token'),
    })),
}))

jest.mock('./Imports/components/CsvColumnMatching/CsvColumnMatching', () => ({
    __esModule: true,
    CsvColumnMatching: () => <div data-testid="csv-column-matching" />,
}))

jest.mock('../../../common/components/PageHeader', () => ({
    __esModule: true,
    PageHeader: () => <div data-testid="page-header" />,
}))
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)
;(useSupportedLocales as jest.Mock).mockReturnValue([
    { code: 'en-US', name: 'English' },
])
;(useHelpCenterApi as jest.Mock).mockReturnValue({ client: {} })

const renderWithSearch = (search: string) =>
    render(<HelpCenterImportCsvColumnMatchingView />, {
        initialEntries: [`/${search}`],
    })

describe('<HelpCenterImportCsvColumnMatchingView />', () => {
    let mockAPI: MockAdapter
    beforeAll(async () => {
        const migrationClient = await getMigrationClient()
        mockAPI = new MockAdapter(migrationClient)
        ;(useMigrationApi as jest.Mock).mockImplementation(
            () => migrationClient,
        )
    })

    beforeEach(() => {
        mockAPI.reset()
    })

    afterEach(() => {
        act(() => {
            toast.dismiss()
        })
    })

    it('shows an error toast when the file_url query param is missing', async () => {
        // Sonner does not render toasts fired synchronously inside the very
        // first render's useEffect when the Toaster mounts in the same commit,
        // so we assert on the toast.error call rather than the rendered DOM
        // element. Other (async-fired) error toasts in this view are asserted
        // via getByRole('status') below.
        const errorSpy = jest.spyOn(toast, 'error')
        renderWithSearch('?other=1')

        await waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringMatching(/missing URL parameter file_url/i),
                expect.objectContaining({ duration: Infinity }),
            )
        })

        errorSpy.mockRestore()
    })

    it('shows an error toast when the CSV analysis returns a FAILED status', async () => {
        mockAPI.onPost('/api/help_center/csv/analysis').reply(200, {
            result: {
                status: 'FAILED',
                error: 'MALFORMED_FILE',
            },
        })

        renderWithSearch('?file_url=https://example.com/file.csv')

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Could not analyse CSV file: the file is not valid/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when the CSV analysis exceeds 400 articles', async () => {
        mockAPI.onPost('/api/help_center/csv/analysis').reply(200, {
            result: {
                status: 'FAILED',
                error: 'FILE_OVER_400_ROWS',
            },
        })

        renderWithSearch('?file_url=https://example.com/file.csv')

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /file contains more than 400 articles/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when the CSV analysis times out with a 408', async () => {
        mockAPI.onPost('/api/help_center/csv/analysis').reply(408, {})

        renderWithSearch('?file_url=https://example.com/file.csv')

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /CSV analysis took too long/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when the CSV file URL cannot be loaded', async () => {
        mockAPI.onPost('/api/help_center/csv/analysis').reply(500, {})

        renderWithSearch('?file_url=https://example.com/file.csv')

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Could not load CSV file from url/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
