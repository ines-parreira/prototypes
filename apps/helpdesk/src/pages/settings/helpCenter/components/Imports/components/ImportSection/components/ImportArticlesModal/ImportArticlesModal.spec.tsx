import type React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { noop } from '@gorgias/toolkit'

import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useCurrentHelpCenter } from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { migrationProviders } from '../../fixtures/migration-providers'
import type { FetchedProvidersState } from '../../types'
import { ImportArticlesModal } from './ImportArticlesModal'
import { buildCsvColumnMatchingUrl, fileIsTooBig } from './utils'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    [getSingleHelpCenterResponseFixture.id]:
                        getSingleHelpCenterResponseFixture,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {
        helpCenter: { ...uiState, currentId: 1 },
    } as any,
}

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                generateCsvTemplate: jest.fn(),
            },
        }),
    }
})

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)

const fetchedProvidersStateSuccess: FetchedProvidersState = {
    data: migrationProviders,
    isError: false,
    isLoading: false,
}

const getFile = () => new File([], 'Imported Articles.csv')

const renderComponent = (element: React.ReactElement) =>
    render(element, {
        reduxMiddlewares: [thunk],
        storeState: mockStore(defaultState).getState(),
    })

describe('<ImportArticlesModal />', () => {
    describe('renders correctly for each state', () => {
        test('migration feature disabled', () => {
            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'NO_FILE_SELECTED',
                    }}
                    fetchedProviders={{
                        data: null,
                        isLoading: false,
                        isError: false,
                    }}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={noop}
                    isMigrationAvailable={false}
                    onMigrationDropAreaClick={noop}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Import articles')).toBeInTheDocument()
            expect(
                screen.queryByText('Import from another provider'),
            ).not.toBeInTheDocument()
        })
        test('no file selected', () => {
            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'NO_FILE_SELECTED',
                    }}
                    fetchedProviders={fetchedProvidersStateSuccess}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={noop}
                    isMigrationAvailable
                    onMigrationDropAreaClick={noop}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Import articles')).toBeInTheDocument()
            expect(
                screen.getByText('Import from another provider'),
            ).toBeInTheDocument()
        })
        test('file selected', () => {
            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'FILE_SELECTED',
                        file: getFile(),
                    }}
                    fetchedProviders={fetchedProvidersStateSuccess}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={noop}
                    isMigrationAvailable
                    onMigrationDropAreaClick={noop}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Imported Articles.csv'),
            ).toBeInTheDocument()
            expect(screen.getByText('Import File')).toBeInTheDocument()
        })
        test('import in progress', () => {
            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'IMPORTING',
                    }}
                    fetchedProviders={fetchedProvidersStateSuccess}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={noop}
                    isMigrationAvailable
                    onMigrationDropAreaClick={noop}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Import articles')).toBeInTheDocument()
            expect(screen.queryByText('Import File')).not.toBeInTheDocument()
        })
        test('loading providers', () => {
            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'NO_FILE_SELECTED',
                    }}
                    fetchedProviders={{
                        data: null,
                        isLoading: true,
                        isError: false,
                    }}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={noop}
                    isMigrationAvailable
                    onMigrationDropAreaClick={noop}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Import articles')).toBeInTheDocument()
            expect(screen.getByRole('status')).toBeInTheDocument()
        })
        test('providers fetching error', () => {
            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'NO_FILE_SELECTED',
                    }}
                    fetchedProviders={{
                        data: null,
                        isLoading: false,
                        isError: true,
                    }}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={noop}
                    isMigrationAvailable
                    onMigrationDropAreaClick={noop}
                />,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Import articles')).toBeInTheDocument()
            expect(
                screen.queryByText('Import from another provider'),
            ).not.toBeInTheDocument()
        })
    })
    describe('callbacks are handled properly', () => {
        test('choosing and dropping file', () => {
            const fileSelectHandler = jest.fn<void, [File]>()

            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'NO_FILE_SELECTED',
                    }}
                    fetchedProviders={fetchedProvidersStateSuccess}
                    onFileRemove={noop}
                    onFileSelect={fileSelectHandler}
                    onImportStart={noop}
                    isMigrationAvailable
                    onMigrationDropAreaClick={noop}
                />,
            )

            const uploadInput = screen.getByTestId(
                'import-articles-modal-file-upload',
            )
            const dropArea = screen.getByTestId(
                'import-articles-modal-file-drop-area',
            )
            const file = getFile()

            fireEvent.change(uploadInput, {
                target: {
                    files: [file],
                },
            })
            fireEvent.drop(dropArea, {
                dataTransfer: {
                    items: [
                        {
                            getAsFile() {
                                return file
                            },
                        },
                    ],
                },
            })

            expect(fileSelectHandler.mock.calls[0][0]).toBe(file)
            expect(fileSelectHandler.mock.calls[1][0]).toBe(file)
        })
        it('should not be able to click on import from another provider while providers are loading', () => {
            const dropAreaClickHandler = jest.fn()

            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'NO_FILE_SELECTED',
                    }}
                    fetchedProviders={{
                        data: null,
                        isLoading: true,
                        isError: false,
                    }}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={noop}
                    isMigrationAvailable
                    onMigrationDropAreaClick={dropAreaClickHandler}
                />,
            )

            fireEvent.click(screen.getByText('Import from another provider'))

            expect(dropAreaClickHandler).not.toBeCalled()
        })
        it('should be able to start import when file is selcted', () => {
            const importStartHandler = jest.fn()

            renderComponent(
                <ImportArticlesModal
                    isOpen
                    onClose={noop}
                    modalState={{
                        state: 'FILE_SELECTED',
                        file: getFile(),
                    }}
                    fetchedProviders={fetchedProvidersStateSuccess}
                    onFileRemove={noop}
                    onFileSelect={noop}
                    onImportStart={importStartHandler}
                    isMigrationAvailable
                    onMigrationDropAreaClick={noop}
                />,
            )

            fireEvent.click(screen.getByText('Import File'))

            expect(importStartHandler).toBeCalled()
        })
    })

    describe('utils are working properly', () => {
        test.each([
            [{ size: 900000 }, false],
            [{ size: 1000000 }, true],
            [{ size: 1100000 }, true],
        ])(
            'fileIsTooBig returns true for files >= than 10MB',
            (file, expectedIsTooBig) => {
                expect(fileIsTooBig(file)).toEqual(expectedIsTooBig)
            },
        )

        test('buildCsvColumnMatchingUrl generated link from help center id and file url', () => {
            const fileUrl =
                'https://storage.googleapis.com/gorgias-help-center-staging-imports/gorgias-articles-1628254255.csv'

            const expectedLink =
                '/app/settings/help-center/1/import/csv/column-matching?file_url=https%3A%2F%2Fstorage.googleapis.com%2Fgorgias-help-center-staging-imports%2Fgorgias-articles-1628254255.csv'

            expect(buildCsvColumnMatchingUrl(1, fileUrl)).toEqual(expectedLink)
        })
    })
})
