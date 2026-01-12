import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

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
import useAppSelector from 'hooks/useAppSelector'
import { renderWithStore } from 'utils/testing'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('@gorgias/helpdesk-queries')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(() => ({ hasAccess: true, isLoading: false })),
}))

const useAppSelectorMock = assumeMock(useAppSelector)
const useListSlaPoliciesMock = assumeMock(useListSlaPolicies)
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

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
        useListSlaPoliciesMock.mockReturnValue({
            data: { data: { data: [] } },
            isError: false,
            isLoading: false,
        } as any)
    })

    it('should show the buttons', () => {
        renderWithStore(<FiltersPanelWrapper />, {})

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.getByText(new RegExp('MockedSavedFiltersPanel')),
        ).toBeTruthy()
    })

    it('should not show the buttons when withSavedFilters prop is false', () => {
        renderWithStore(
            <FiltersPanelWrapper
                optionalFilters={filterKeysMock}
                withSavedFilters={false}
            />,
            {},
        )

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.queryByText(new RegExp('SavedFiltersFormMock')),
        ).toBeFalsy()
    })

    it('should render with normal wrapper styles when compact is false', () => {
        const { container } = renderWithStore(<FiltersPanelWrapper />, {})

        const wrapper = container.querySelector('[class*="wrapper"]')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper?.className).toContain('wrapper')
        expect(wrapper?.className).not.toContain('wrapperCompact')
    })

    it('should render with compact wrapper styles when compact is true', () => {
        const { container } = renderWithStore(
            <FiltersPanelWrapper compact />,
            {},
        )

        const wrapper = container.querySelector('[class*="wrapperCompact"]')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper?.className).toContain('wrapperCompact')
    })

    it('should pass compact prop to FiltersPanel when true', () => {
        renderWithStore(<FiltersPanelWrapper compact />, {})

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                compact: true,
            }),
        )
    })

    it('should pass compact prop as false to FiltersPanel when not provided', () => {
        renderWithStore(<FiltersPanelWrapper />, {})

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
        renderWithStore(
            <FiltersPanelWrapper persistentFilters={persistentFilters} />,
            {},
        )

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                persistentFilters,
            }),
        )
    })

    it('should pass optionalFilters to FiltersPanel', () => {
        const optionalFilters = [FilterKey.Channels, FilterKey.Tags]
        renderWithStore(
            <FiltersPanelWrapper optionalFilters={optionalFilters} />,
            {},
        )

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
        renderWithStore(
            <FiltersPanelWrapper
                filterSettingsOverrides={filterSettingsOverrides}
            />,
            {},
        )

        expect(MockFiltersPanel).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides,
            }),
        )
    })
})
