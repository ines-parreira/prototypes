import {fireEvent} from '@testing-library/react'

import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {SavedFilter} from 'models/stat/types'
import ApplySavedFilers, {
    APPLY_SAVED_FILTERS,
    CREATE_SAVED_FILTERS_LABEL,
    NO_FILTERS_CONTENT,
    NOT_ADMIN_CONTENT,
} from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import {initialiseSavedFilterDraft} from 'state/ui/stats/filtersSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

const savedFilters: SavedFilter[] = [
    {id: 1, name: 'Temp Filter 1', filter_group: []},
    {id: 2, name: 'Temp Filter 2', filter_group: []},
]

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('ApplySavedFilers', () => {
    it('should render the component for an admin', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={[]} />,
            {}
        )

        expect(queryByText(NO_FILTERS_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(NO_FILTERS_CONTENT)).toBeTruthy()
    })

    it('should render a different content for a normal user', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin={false} savedFilters={[]} />,
            {}
        )

        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(NOT_ADMIN_CONTENT)).toBeTruthy()
    })

    it('should show the saved filters for a normal user', () => {
        const {getByText, queryByText} = renderWithStore(
            <ApplySavedFilers isAdmin={false} savedFilters={savedFilters} />,
            {}
        )
        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))

        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should allow admin to create the Saved Filter Draft', () => {
        const {getByText, store} = renderWithStore(
            <ApplySavedFilers isAdmin={true} savedFilters={savedFilters} />,
            {}
        )

        fireEvent.click(getByText('arrow_drop_down'))
        expect(getByText(CREATE_SAVED_FILTERS_LABEL)).toBeEnabled()
        fireEvent.click(getByText(CREATE_SAVED_FILTERS_LABEL))

        expect(store.getActions()).toContainEqual(initialiseSavedFilterDraft())
    })

    it('should render a dropdown items for Admins', () => {
        const {getByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />,
            {}
        )

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
        fireEvent.click(getByText('arrow_drop_down'))

        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should log segment event on filter click', () => {
        const {getByText} = renderWithStore(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />,
            {}
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
})
