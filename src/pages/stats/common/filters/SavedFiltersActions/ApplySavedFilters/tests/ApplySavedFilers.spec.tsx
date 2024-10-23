import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import ApplySavedFilers, {
    APPLY_SAVED_FILTERS,
    NO_FILTERS_CONTENT,
    NOT_ADMIN_CONTENT,
} from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'

const savedFilters = [
    {id: 1, name: 'Temp Filter 1'},
    {id: 2, name: 'Temp Filter 2'},
]

describe('ApplySavedFilers', () => {
    it('should render the component for an admin', () => {
        const {getByText, queryByText} = render(
            <ApplySavedFilers isAdmin savedFilters={[]} />
        )
        expect(queryByText(NO_FILTERS_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))
        expect(getByText(NO_FILTERS_CONTENT)).toBeTruthy()
    })

    it('should render a different content for a normal user', () => {
        const {getByText, queryByText} = render(
            <ApplySavedFilers isAdmin={false} savedFilters={[]} />
        )
        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))
        expect(getByText(NOT_ADMIN_CONTENT)).toBeTruthy()
    })

    it('should show the saved filters for a normal user', () => {
        const {getByText, queryByText} = render(
            <ApplySavedFilers isAdmin={false} savedFilters={savedFilters} />
        )
        expect(queryByText(NOT_ADMIN_CONTENT)).toBeFalsy()
        fireEvent.click(getByText(APPLY_SAVED_FILTERS))
        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })

    it('should render a dropdown items for Admins', () => {
        const {getByText} = render(
            <ApplySavedFilers isAdmin savedFilters={savedFilters} />
        )
        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
        fireEvent.click(getByText('arrow_drop_down'))
        expect(getByText(savedFilters[0].name)).toBeTruthy()
        expect(getByText(savedFilters[1].name)).toBeTruthy()
    })
})
