import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListSlaPoliciesHandler,
    mockListSlaPoliciesResponse,
} from '@gorgias/helpdesk-mocks'

import { UserRole } from 'config/types/user'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {
    emptyFiltersMock,
    filterKeysMock,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/tests/helpers.spec'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { useAppSelector } from 'hooks/useAppSelector'

jest.mock('hooks/useAppSelector', () => ({ useAppSelector: jest.fn() }))
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(() => ({ hasAccess: true, isLoading: false })),
}))

const useAppSelectorMock = assumeMock(useAppSelector)
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const server = setupServer(
    mockListSlaPoliciesHandler(async () =>
        HttpResponse.json(mockListSlaPoliciesResponse({ data: [] })),
    ).handler,
)

const MockFiltersPanel = jest.fn((__props: any) => <>FiltersPanelMock</>)
const MockSavedFiltersPanel = jest.fn((__props: any) => (
    <>MockedSavedFiltersPanel</>
))
const MockSavedFiltersActions = jest.fn((__props: any) => (
    <>SavedFiltersActionsMock</>
))

jest.mock('domains/reporting/pages/common/filters/FiltersPanel', () => ({
    FiltersPanel: (props: any) => MockFiltersPanel(props) as any,
}))
jest.mock('domains/reporting/pages/common/filters/SavedFiltersPanel', () => ({
    SavedFiltersPanel: (props: any) => MockSavedFiltersPanel(props) as any,
}))
jest.mock(
    'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions',
    () => ({
        SavedFiltersActions: (props: any) =>
            MockSavedFiltersActions(props) as any,
    }),
)

describe('FiltersPanelWrapper with mocked children', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        useAppSelectorMock.mockReturnValueOnce(
            fromJS({
                role: {
                    name: UserRole.Agent,
                },
            }),
        )
        useAppSelectorMock.mockReturnValueOnce(emptyFiltersMock)
        useCustomFieldDefinitionsMock.mockReturnValue(
            apiListCursorPaginationResponse([]) as any,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should show the buttons', () => {
        render(<FiltersPanelWrapper />, { storeState: {} })

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.getByText(new RegExp('MockedSavedFiltersPanel')),
        ).toBeTruthy()
    })

    it('should not show the buttons when withSavedFilters prop is false', () => {
        render(
            <FiltersPanelWrapper
                optionalFilters={filterKeysMock}
                withSavedFilters={false}
            />,
            { storeState: {} },
        )

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.queryByText(new RegExp('SavedFiltersFormMock')),
        ).toBeFalsy()
    })

    it('should render with normal wrapper styles when compact is false', () => {
        const { container } = render(<FiltersPanelWrapper />, {
            storeState: {},
        })

        const wrapper = container.querySelector('[class*="wrapper"]')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper?.className).toContain('wrapper')
        expect(wrapper?.className).not.toContain('wrapperCompact')
    })

    it('should render with compact wrapper styles when compact is true', () => {
        const { container } = render(<FiltersPanelWrapper compact />, {
            storeState: {},
        })

        const wrapper = container.querySelector('[class*="wrapperCompact"]')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper?.className).toContain('wrapperCompact')
    })

    it('should pass compact prop to FiltersPanel when true', () => {
        render(<FiltersPanelWrapper compact />, { storeState: {} })

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                compact: true,
            }),
        )
    })

    it('should pass compact prop as false to FiltersPanel when not provided', () => {
        render(<FiltersPanelWrapper />, { storeState: {} })

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                compact: false,
            }),
        )
    })

    it('should pass persistentFilters to FiltersPanel', () => {
        const persistentFilters: StaticFilter[] = [
            FilterKey.Period,
            FilterKey.AggregationWindow,
        ]
        render(<FiltersPanelWrapper persistentFilters={persistentFilters} />, {
            storeState: {},
        })

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                persistentFilters,
            }),
        )
    })

    it('should pass optionalFilters to FiltersPanel', () => {
        const optionalFilters = [FilterKey.Channels, FilterKey.Tags]
        render(<FiltersPanelWrapper optionalFilters={optionalFilters} />, {
            storeState: {},
        })

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters,
            }),
        )
    })

    it('should pass filterSettingsOverrides to FiltersPanel', () => {
        const filterSettingsOverrides = {
            [FilterKey.Period]: {
                initialSettings: { maxSpan: 365 },
            },
        }
        render(
            <FiltersPanelWrapper
                filterSettingsOverrides={filterSettingsOverrides}
            />,
            { storeState: {} },
        )

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides,
            }),
        )
    })
})
