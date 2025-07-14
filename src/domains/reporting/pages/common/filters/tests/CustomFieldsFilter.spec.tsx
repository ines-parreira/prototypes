import React from 'react'

import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { logEvent, SegmentEvent } from 'common/segment'
import { useGetCustomFieldDefinitions } from 'custom-fields/hooks/queries/queries'
import {
    getCustomFieldValueSerializer,
    withDefaultCustomFieldAndLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import CustomFieldsFilter, {
    CustomFieldsFilterWithSavedState,
    CustomFieldsFilterWithState,
} from 'domains/reporting/pages/common/filters/CustomFieldsFilter'
import { emptyCustomFieldFilter } from 'domains/reporting/pages/common/filters/helpers'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

const customFieldId = 123
const filterName = 'Some Custom Field Name'
const defaultState = {
    stats: statsSlice.initialState,
} as RootState

jest.mock('custom-fields/hooks/queries/queries')
const useGetCustomFieldDefinitionsMock = assumeMock(
    useGetCustomFieldDefinitions,
)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const dispatchUpdate = jest.fn()
const dispatchRemove = jest.fn()
const dispatchStatFiltersDirty = jest.fn()
const dispatchStatFiltersClean = jest.fn()

const renderComponent = () =>
    renderWithStore(
        <CustomFieldsFilter
            customFieldId={customFieldId}
            filterName={filterName}
            dispatchUpdate={dispatchUpdate}
            dispatchRemove={dispatchRemove}
            dispatchStatFiltersDirty={dispatchStatFiltersDirty}
            dispatchStatFiltersClean={dispatchStatFiltersClean}
        />,
        defaultState,
    )

const customFieldOptions = ['Custom::Field Name', 'Another::Custom Field Name']

const dropdownCustomFieldDefinition = {
    ...ticketDropdownFieldDefinition,
    id: customFieldId,
    definition: {
        ...ticketDropdownFieldDefinition.definition,
        input_settings: {
            ...ticketDropdownFieldDefinition.definition.input_settings,
            choices: customFieldOptions,
        },
    },
}

const clearFilterIcon = 'close'

describe('CustomFieldsFilter', () => {
    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue({
            data: apiListCursorPaginationResponse([
                dropdownCustomFieldDefinition,
            ]),
        } as any)
    })

    it('Should render CustomFieldsFilter', () => {
        renderComponent()

        expect(screen.getByText(filterName)).toBeInTheDocument()
    })

    it('should open and close Custom Field component', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        expect(dispatchStatFiltersDirty).toHaveBeenCalled()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        expect(dispatchStatFiltersClean).toHaveBeenCalled()
    })

    it('should render Custom Field options', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(customFieldOptions[0])).toBeInTheDocument()
        expect(screen.getByText(customFieldOptions[1])).toBeInTheDocument()
    })

    it('should dispatch mergeCustomFieldsFilter action on selecting a custom field', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(customFieldOptions[0]))
        userEvent.click(screen.getByText(customFieldOptions[1]))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: [
                getCustomFieldValueSerializer(customFieldId)(
                    customFieldOptions[0],
                ),
            ],
            operator: LogicalOperatorEnum.ONE_OF,
        })
        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: [
                getCustomFieldValueSerializer(customFieldId)(
                    customFieldOptions[1],
                ),
            ],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch mergeCustomFieldsFilter action on deselecting a custom field', () => {
        renderWithStore(
            <CustomFieldsFilter
                filterName={filterName}
                customFieldId={customFieldId}
                value={{
                    values: [
                        getCustomFieldValueSerializer(customFieldId)(
                            customFieldOptions[0],
                        ),
                    ],
                    customFieldId,
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        userEvent.click(
            screen.getByRole('option', { name: customFieldOptions[0] }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch mergeCustomFieldsFilter action on selecting all integrations and deselecting all integrations', () => {
        const { rerender, store } = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: allAvailableCustomFields,
            operator: LogicalOperatorEnum.ONE_OF,
        })

        rerender(
            <Provider store={store}>
                <CustomFieldsFilter
                    filterName={filterName}
                    customFieldId={customFieldId}
                    value={{
                        values: allAvailableCustomFields,
                        customFieldId,
                        operator: LogicalOperatorEnum.ONE_OF,
                    }}
                    dispatchUpdate={dispatchUpdate}
                    dispatchRemove={dispatchRemove}
                    dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                    dispatchStatFiltersClean={dispatchStatFiltersClean}
                />
            </Provider>,
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch mergeCustomFieldsFilter action on deselecting one of the custom fields', () => {
        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption),
        )
        renderWithStore(
            <CustomFieldsFilter
                customFieldId={customFieldId}
                filterName={filterName}
                value={{
                    values: allAvailableCustomFields,
                    customFieldId,
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        userEvent.click(
            screen.getByRole('option', { name: customFieldOptions[0] }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: allAvailableCustomFields.filter(
                (field) =>
                    field !==
                    getCustomFieldValueSerializer(customFieldId)(
                        customFieldOptions[0],
                    ),
            ),
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption),
        )
        renderWithStore(
            <CustomFieldsFilter
                customFieldId={customFieldId}
                filterName={filterName}
                value={{
                    values: allAvailableCustomFields,
                    customFieldId,
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith(customFieldId)
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        const { store, rerender } = renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(
            screen.getByLabelText(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
            ),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: [],
            operator: LogicalOperatorEnum.NOT_ONE_OF,
        })

        rerender(
            <Provider store={store}>
                <CustomFieldsFilter
                    filterName={filterName}
                    customFieldId={customFieldId}
                    value={{
                        values: [],
                        customFieldId,
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                    }}
                    dispatchUpdate={dispatchUpdate}
                    dispatchRemove={dispatchRemove}
                    dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                    dispatchStatFiltersClean={dispatchStatFiltersClean}
                />
            </Provider>,
        )

        userEvent.click(
            screen.getByLabelText(
                LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
            ),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            customFieldId,
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should not break if customfFieldId is not found', () => {
        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption),
        )
        const wrongId = 122
        renderWithStore(
            <CustomFieldsFilter
                customFieldId={wrongId}
                filterName={filterName}
                value={withDefaultCustomFieldAndLogicalOperator({
                    customFieldId,
                    values: allAvailableCustomFields,
                })}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith(wrongId)
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: `tf_${filterName}`,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })
})

describe('CustomFieldsFilterFilterWithState', () => {
    const customFieldOptionsFromState = ['123::Another::Custom Field Name']
    const customFieldsState = {
        ...defaultState,
        stats: {
            ...defaultState.stats,
            filters: {
                ...defaultState.stats.filters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: customFieldOptionsFromState,
                    },
                ],
            },
        },
    } as RootState

    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue({
            data: apiListCursorPaginationResponse([
                dropdownCustomFieldDefinition,
            ]),
        } as any)
    })

    it('should render CustomFieldsFilterWithState and select an option from redux state by default', () => {
        const spy = jest.spyOn(statsSlice, 'mergeCustomFieldsFilter')

        renderWithStore(
            <CustomFieldsFilterWithState
                customFieldId={customFieldId}
                filterName={filterName}
            />,
            customFieldsState,
        )

        expect(
            screen.queryByText(FILTER_VALUE_PLACEHOLDER),
        ).not.toBeInTheDocument()
        expect(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(customFieldOptions[0]),
        ).not.toBeInTheDocument()
        expect(screen.getByText(customFieldOptions[1])).toBeInTheDocument()

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
        expect(spy).toHaveBeenCalledWith(emptyCustomFieldFilter(customFieldId))
    })
})

describe('CustomFieldsFilterWithSavedState', () => {
    const customFieldValue = 'Another::Custom Field Name'
    const customFieldOptionsFromState = [
        getCustomFieldValueSerializer(customFieldId)(customFieldValue),
    ]
    const customFieldsState = {
        ...defaultState,
        stats: {
            ...defaultState.stats,
            filters: {
                ...defaultState.stats.filters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: customFieldOptionsFromState,
                    },
                ],
            },
        },
        ui: {
            stats: {
                filters: {
                    ...filtersSlice.initialState,
                    savedFilterDraft: {
                        name: 'some filter draft',
                        filter_group: [
                            {
                                member: FilterKey.CustomFields,
                                values: [
                                    {
                                        operator: LogicalOperatorEnum.ONE_OF,
                                        custom_field_id: String(customFieldId),
                                        values: [customFieldValue],
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    } as RootState

    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue({
            data: apiListCursorPaginationResponse([
                dropdownCustomFieldDefinition,
            ]),
        } as any)
    })

    it('should render CustomFieldsFilterWithSavedState and select an option from redux state by default', () => {
        const spy = jest.spyOn(
            filtersSlice,
            'upsertSavedFilterCustomFieldFilter',
        )
        const removeSpy = jest.spyOn(
            filtersSlice,
            'removeFilterFromSavedFilterDraft',
        )

        renderWithStore(
            <CustomFieldsFilterWithSavedState
                customFieldId={customFieldId}
                filterName={filterName}
            />,
            customFieldsState,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(spy).toHaveBeenCalled()

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
        expect(removeSpy).toHaveBeenCalledWith({
            filterKey: FilterKey.CustomFields,
            customFieldId,
        })
    })
})
