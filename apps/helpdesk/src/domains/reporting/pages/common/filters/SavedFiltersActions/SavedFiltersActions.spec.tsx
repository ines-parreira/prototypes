import { assumeMock, render, userEvent } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockAnalyticsFilter,
    mockListAnalyticsFiltersHandler,
    mockListAnalyticsFiltersResponse,
} from '@gorgias/helpdesk-mocks'

import { APPLY_SAVED_FILTERS } from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import { SavedFiltersActions } from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions'
import {
    SAVE_FILTERS,
    SAVE_FILTERS_TOOLTIP,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/SaveFilters/SaveFilters'
import {
    emptyFiltersMock,
    filterKeysMock,
    filtersMock,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/tests/helpers.spec'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { initialiseSavedFilterDraftFromFilters } from 'domains/reporting/state/ui/stats/filtersSlice'
import { useAppSelector } from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('domains/reporting/state/stats/selectors', () => ({
    getPageStatsFiltersWithLogicalOperators: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => ({ useAppSelector: jest.fn() }))
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('utils')
const isTeamLeadMock = assumeMock(isTeamLead)

const server = setupServer()

const savedFilters = [
    mockAnalyticsFilter({ id: 1, name: 'Temp Filter 1', filter_group: [] }),
    mockAnalyticsFilter({ id: 2, name: 'Temp Filter 2', filter_group: [] }),
]

const mockSavedFiltersList = (
    filters: Array<(typeof savedFilters)[number]> = [],
) =>
    mockListAnalyticsFiltersHandler(async () =>
        HttpResponse.json(mockListAnalyticsFiltersResponse({ data: filters })),
    ).handler

const mockSelectors = (statsFilters: unknown) => {
    useAppSelectorMock.mockImplementation((selector) => {
        if (selector === getPageStatsFiltersWithLogicalOperators) {
            return statsFilters
        }
        if (selector === getCurrentUser) {
            return {}
        }

        return undefined
    })
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockSavedFiltersList())
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('SavedFiltersActions for an Agent', () => {
    beforeEach(() => {
        mockSelectors(emptyFiltersMock)
        isTeamLeadMock.mockReturnValue(false)
    })

    it('should only render ApplySavedFilters', () => {
        const { queryByText, getByText } = render(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            { storeState: {} },
        )

        expect(queryByText(SAVE_FILTERS)).toBeFalsy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should render ApplySavedFilters and SaveFilters', () => {
        const { queryByText, getByText } = render(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            { storeState: {} },
        )

        expect(queryByText(SAVE_FILTERS)).toBeFalsy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })
})

describe('SavedFiltersActions for an Admin or Team Lead', () => {
    beforeEach(() => {
        mockSelectors(filtersMock)
        isTeamLeadMock.mockReturnValue(true)
    })

    it('should render ApplySavedFilters and SaveFilters', async () => {
        server.use(mockSavedFiltersList(savedFilters))

        const { getByText } = render(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            { storeState: {} },
        )

        expect(await screen.findByText(SAVE_FILTERS)).toBeTruthy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should have a tooltip', async () => {
        server.use(mockSavedFiltersList(savedFilters))

        const { getByText } = render(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            { storeState: {} },
        )

        fireEvent.mouseEnter(await screen.findByText(SAVE_FILTERS))

        await waitFor(() =>
            expect(getByText(SAVE_FILTERS_TOOLTIP)).toBeTruthy(),
        )
    })

    it('should create SavedFilter draft from current filters', async () => {
        server.use(mockSavedFiltersList(savedFilters))

        const { getByText, store } = render(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            { storeState: {} },
        )

        expect(await screen.findByText(SAVE_FILTERS)).toBeTruthy()
        await userEvent.click(getByText(SAVE_FILTERS))

        expect(store.getActions()).toContainEqual(
            initialiseSavedFilterDraftFromFilters(filtersMock),
        )
    })
})
