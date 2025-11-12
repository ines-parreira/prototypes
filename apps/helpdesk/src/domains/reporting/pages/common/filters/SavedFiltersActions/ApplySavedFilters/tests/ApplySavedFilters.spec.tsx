import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { fireEvent, waitFor } from '@testing-library/react'

import { SavedFilter } from 'domains/reporting/models/stat/types'
import ApplySavedFilers, {
    APPLY_SAVED_FILTER_TOOLTIP,
    APPLY_SAVED_FILTERS,
    CREATE_SAVED_FILTERS_LABEL,
    NO_FILTERS_CONTENT,
    NOT_ADMIN_CONTENT,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import { initialiseSavedFilterDraft } from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

const savedFilters: SavedFilter[] = [
    { id: 1, name: 'Temp Filter 1', filter_group: [] },
    { id: 2, name: 'Temp Filter 2', filter_group: [] },
]

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

const defaultState = {
    ui: { stats: { filters: { appliedSavedFilterId: 0 } } },
} as RootState

describe('ApplySavedFilers', () => {
    it('should render the component for an admin', () => {
        const { getByText, queryByText } = renderWithStore(
            <ApplySavedFilers canEdit savedFilters={[]} />,
            defaultState,
        )

        expect(queryByText(NO_FILTERS_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(NO_FILTERS_CONTENT)).toBeTruthy()
    })

    it('should render a different content for a normal user', () => {
        const { getByText, queryByText } = renderWithStore(
            <ApplySavedFilers canEdit={false} savedFilters={[]} />,
            defaultState,
        )

        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(NOT_ADMIN_CONTENT)).toBeTruthy()
    })

    it('should have a descriptive tooltip', async () => {
        const { getByText } = renderWithStore(
            <ApplySavedFilers canEdit={false} savedFilters={[]} />,
            defaultState,
        )

        fireEvent.mouseEnter(getByText(APPLY_SAVED_FILTERS))

        await waitFor(() =>
            expect(getByText(APPLY_SAVED_FILTER_TOOLTIP)).toBeTruthy(),
        )
    })

    it('should show the saved filters for a normal user', () => {
        const { getByText, queryByText } = renderWithStore(
            <ApplySavedFilers canEdit={false} savedFilters={savedFilters} />,
            defaultState,
        )
        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should allow admin to create the Saved Filter Draft', () => {
        const { getByText, store } = renderWithStore(
            <ApplySavedFilers canEdit={true} savedFilters={savedFilters} />,
            defaultState,
        )

        fireEvent.click(getByText('arrow_drop_down'))
        expect(getByText(CREATE_SAVED_FILTERS_LABEL)).toBeEnabled()
        fireEvent.click(getByText(CREATE_SAVED_FILTERS_LABEL))

        expect(store.getActions()).toContainEqual(initialiseSavedFilterDraft())
    })

    it('should render a dropdown items for Admins', () => {
        const { getByText } = renderWithStore(
            <ApplySavedFilers canEdit savedFilters={savedFilters} />,
            defaultState,
        )

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
        fireEvent.click(getByText('arrow_drop_down'))

        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should log segment event on filter click', () => {
        const { getByText } = renderWithStore(
            <ApplySavedFilers canEdit savedFilters={savedFilters} />,
            defaultState,
        )

        fireEvent.click(getByText(APPLY_SAVED_FILTERS))
        fireEvent.click(getByText(savedFilters[0].name))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatSavedFilterSelected,
            {
                name: savedFilters[0].name,
                id: savedFilters[0].id,
            },
        )
    })

    it('should render the component for an admin', () => {
        const { getByText, queryByText } = renderWithStore(
            <ApplySavedFilers canEdit savedFilters={savedFilters} />,
            {
                ui: { stats: { filters: { appliedSavedFilterId: 1 } } },
            } as RootState,
        )

        expect(queryByText(APPLY_SAVED_FILTERS)).toBeFalsy()
        expect(getByText(savedFilters[0].name)).toBeTruthy()
    })

    it('should render draft filter name instead of applied filter name', () => {
        const { getByText, queryByText } = renderWithStore(
            <ApplySavedFilers canEdit savedFilters={savedFilters} />,
            {
                ui: {
                    stats: {
                        filters: {
                            appliedSavedFilterId: 1,
                            savedFilterDraft: savedFilters[1],
                        },
                    },
                },
            } as RootState,
        )

        expect(queryByText(APPLY_SAVED_FILTERS)).toBeFalsy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should show default value if the saved filters name is empty', () => {
        const { getByText } = renderWithStore(
            <ApplySavedFilers canEdit savedFilters={savedFilters} />,
            {
                ui: {
                    stats: {
                        filters: {
                            appliedSavedFilterId: 1,
                            savedFilterDraft: {
                                ...savedFilters[1],
                                name: '',
                            },
                        },
                    },
                },
            } as RootState,
        )

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    describe('Apply filters button content', () => {
        it('renders default message', () => {
            const { queryByText } = renderWithStore(
                <ApplySavedFilers canEdit savedFilters={savedFilters} />,
                {
                    ui: {
                        stats: {
                            filters: {
                                appliedSavedFilterId: null,
                                savedFilterDraft: null,
                            },
                        },
                    },
                } as RootState,
            )

            expect(queryByText(APPLY_SAVED_FILTERS)).toBeInTheDocument()
        })

        it('renders filter name if selected', () => {
            const selectedFilter = savedFilters[1]

            const { queryByText } = renderWithStore(
                <ApplySavedFilers canEdit savedFilters={savedFilters} />,
                {
                    ui: {
                        stats: {
                            filters: {
                                appliedSavedFilterId: selectedFilter.id,
                                savedFilterDraft: null,
                            },
                        },
                    },
                } as RootState,
            )

            expect(queryByText(selectedFilter.name)).toBeInTheDocument()
        })

        it('renders default message if filter is not found', () => {
            const { queryByText } = renderWithStore(
                <ApplySavedFilers canEdit savedFilters={savedFilters} />,
                {
                    ui: {
                        stats: {
                            filters: {
                                appliedSavedFilterId: 999,
                                savedFilterDraft: null,
                            },
                        },
                    },
                } as RootState,
            )

            expect(queryByText(APPLY_SAVED_FILTERS)).toBeInTheDocument()
        })

        it('renders draft name if exist', () => {
            const selectedFilter = savedFilters[1]
            const draftName = 'slim shady'

            const { queryByText } = renderWithStore(
                <ApplySavedFilers canEdit savedFilters={savedFilters} />,
                {
                    ui: {
                        stats: {
                            filters: {
                                appliedSavedFilterId: selectedFilter.id,
                                savedFilterDraft: {
                                    ...selectedFilter,
                                    name: draftName,
                                },
                            },
                        },
                    },
                } as RootState,
            )

            expect(queryByText(draftName)).toBeInTheDocument()
        })

        it('truncates text if too long', () => {
            const selectedFilter = savedFilters[1]
            const draftName =
                'hi! my name is what? my name is who? my name is chka-chka slim shady'

            const { queryByText } = renderWithStore(
                <ApplySavedFilers canEdit savedFilters={savedFilters} />,
                {
                    ui: {
                        stats: {
                            filters: {
                                appliedSavedFilterId: selectedFilter.id,
                                savedFilterDraft: {
                                    ...selectedFilter,
                                    name: draftName,
                                },
                            },
                        },
                    },
                } as RootState,
            )

            expect(queryByText(/^hi!.*\.\.\.$/)).toBeInTheDocument()
        })
    })

    describe('toggleCanduId', () => {
        it('should set data-candu-id when canEdit is true and pinnedFilter exists', () => {
            const pinnedFilter = {
                id: 1,
                pin: jest.fn(),
            }

            const { container } = renderWithStore(
                <ApplySavedFilers
                    canEdit={true}
                    savedFilters={savedFilters}
                    pinnedFilter={pinnedFilter}
                />,
                defaultState,
            )

            const toggleButton = container.querySelector(
                '[data-candu-id="pinned-filter-dropdown-button"]',
            )
            expect(toggleButton).toBeInTheDocument()
        })

        it('should not set data-candu-id when canEdit is false', () => {
            const pinnedFilter = {
                id: 1,
                pin: jest.fn(),
            }

            const { container } = renderWithStore(
                <ApplySavedFilers
                    canEdit={false}
                    savedFilters={savedFilters}
                    pinnedFilter={pinnedFilter}
                />,
                defaultState,
            )

            const toggleButton = container.querySelector(
                '[data-candu-id="pinned-filter-dropdown-button"]',
            )
            expect(toggleButton).not.toBeInTheDocument()
        })

        it('should not set data-candu-id when pinnedFilter is undefined', () => {
            const { container } = renderWithStore(
                <ApplySavedFilers
                    canEdit={true}
                    savedFilters={savedFilters}
                    pinnedFilter={undefined}
                />,
                defaultState,
            )

            const toggleButton = container.querySelector(
                '[data-candu-id="pinned-filter-dropdown-button"]',
            )
            expect(toggleButton).not.toBeInTheDocument()
        })

        it('should not set data-candu-id when both canEdit is false and pinnedFilter is undefined', () => {
            const { container } = renderWithStore(
                <ApplySavedFilers
                    canEdit={false}
                    savedFilters={savedFilters}
                    pinnedFilter={undefined}
                />,
                defaultState,
            )

            const toggleButton = container.querySelector(
                '[data-candu-id="pinned-filter-dropdown-button"]',
            )
            expect(toggleButton).not.toBeInTheDocument()
        })
    })
})
