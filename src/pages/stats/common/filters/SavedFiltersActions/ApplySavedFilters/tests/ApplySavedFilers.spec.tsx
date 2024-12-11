import {fireEvent, waitFor} from '@testing-library/react'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {SavedFilter} from 'models/stat/types'
import ApplySavedFilers, {
    APPLY_SAVED_FILTER_TOOLTIP,
    APPLY_SAVED_FILTERS,
    CREATE_SAVED_FILTERS_LABEL,
    getApplyFiltersButtonName,
    NO_FILTERS_CONTENT,
    NOT_ADMIN_CONTENT,
} from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import {RootState} from 'state/types'
import {initialiseSavedFilterDraft} from 'state/ui/stats/filtersSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

const savedFilters: SavedFilter[] = [
    {id: 1, name: 'Temp Filter 1', filter_group: []},
    {id: 2, name: 'Temp Filter 2', filter_group: []},
]

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

const defaultState = {
    ui: {stats: {filters: {appliedSavedFilterId: 0}}},
} as RootState

describe('ApplySavedFilers', () => {
    it('should render the component for an admin', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={[]} />,
            defaultState
        )

        expect(queryByText(NO_FILTERS_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(NO_FILTERS_CONTENT)).toBeTruthy()
    })

    it('should render a different content for a normal user', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin={false} savedFilters={[]} />,
            defaultState
        )

        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(NOT_ADMIN_CONTENT)).toBeTruthy()
    })

    it('should have a descriptive tooltip', async () => {
        const {getByText} = renderWithStore(
            <ApplySavedFilers isAdmin={false} savedFilters={[]} />,
            defaultState
        )

        fireEvent.mouseEnter(getByText(APPLY_SAVED_FILTERS))

        await waitFor(() =>
            expect(getByText(APPLY_SAVED_FILTER_TOOLTIP)).toBeTruthy()
        )
    })

    it('should show the saved filters for a normal user', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin={false} savedFilters={savedFilters} />,
            defaultState
        )
        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should allow admin to create the Saved Filter Draft', () => {
        const {getByText, store} = renderWithStore(
            <ApplySavedFilers isAdmin={true} savedFilters={savedFilters} />,
            defaultState
        )

        fireEvent.click(getByText('arrow_drop_down'))
        expect(getByText(CREATE_SAVED_FILTERS_LABEL)).toBeEnabled()
        fireEvent.click(getByText(CREATE_SAVED_FILTERS_LABEL))

        expect(store.getActions()).toContainEqual(initialiseSavedFilterDraft())
    })

    it('should render a dropdown items for Admins', () => {
        const {getByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />,
            defaultState
        )

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
        fireEvent.click(getByText('arrow_drop_down'))

        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should log segment event on filter click', () => {
        const {getByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />,
            defaultState
        )

        fireEvent.click(getByText(APPLY_SAVED_FILTERS))
        fireEvent.click(getByText(savedFilters[0].name))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatSavedFilterSelected,
            {
                name: savedFilters[0].name,
                id: savedFilters[0].id,
            }
        )
    })

    it('should render the component for an admin', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />,
            {
                ui: {stats: {filters: {appliedSavedFilterId: 1}}},
            } as RootState
        )

        expect(queryByText(APPLY_SAVED_FILTERS)).toBeFalsy()
        expect(getByText(savedFilters[0].name)).toBeTruthy()
    })

    it('should render draft filter name instead of applied filter name', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />,
            {
                ui: {
                    stats: {
                        filters: {
                            appliedSavedFilterId: 1,
                            savedFilterDraft: savedFilters[1],
                        },
                    },
                },
            } as RootState
        )

        expect(queryByText(APPLY_SAVED_FILTERS)).toBeFalsy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should show default value if the saved filters name is empty', () => {
        const {getByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />,
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
            } as RootState
        )

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })
})

const filters = [{id: 1, name: 'Filter 1', filter_group: []}]

describe('getApplyFiltersButtonName', () => {
    it('should return APPLY_SAVED_FILTERS when id is null', () => {
        const result = getApplyFiltersButtonName(filters, null)
        expect(result).toBe(APPLY_SAVED_FILTERS)
    })

    it('should return APPLY_SAVED_FILTERS when id is undefined', () => {
        const result = getApplyFiltersButtonName(filters, undefined as any)
        expect(result).toBe(APPLY_SAVED_FILTERS)
    })

    it('should return APPLY_SAVED_FILTERS if id does not match any filter', () => {
        const result = getApplyFiltersButtonName(
            [
                {id: 1, name: 'Filter 1', filter_group: []},
                {id: 2, name: 'Filter 2', filter_group: []},
            ],
            999
        )
        expect(result).toBe(APPLY_SAVED_FILTERS)
    })

    it('should return the filter name when a matching id is found', () => {
        const result = getApplyFiltersButtonName(
            [
                {id: 1, name: 'Filter 1', filter_group: []},
                {id: 2, name: 'Filter 2', filter_group: []},
            ],
            1
        )
        expect(result).toBe('Filter 1')
    })

    it('should return APPLY_SAVED_FILTERS when filters is empty', () => {
        const result = getApplyFiltersButtonName([], 1)
        expect(result).toBe(APPLY_SAVED_FILTERS)
    })

    it('should return APPLY_SAVED_FILTERS when filter name is empty or null', () => {
        const result = getApplyFiltersButtonName(
            [
                {id: 1, name: '', filter_group: []},
                {id: 2, name: null, filter_group: []} as any,
            ],
            1
        )
        expect(result).toBe(APPLY_SAVED_FILTERS)
    })

    it('should return the first filter name if multiple filters match the same id (edge case)', () => {
        const result = getApplyFiltersButtonName(
            [
                {id: 1, name: 'Filter 1', filter_group: []},
                {id: 1, name: 'Filter 2', filter_group: []},
            ],
            1
        )
        expect(result).toBe('Filter 1')
    })
})
