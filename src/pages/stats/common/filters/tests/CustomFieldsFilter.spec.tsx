import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import {assumeMock, renderWithStore} from 'utils/testing'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {useGetCustomFieldDefinitions} from 'models/customField/queries'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import CustomFieldsFilter, {
    CustomFieldsFilterFilterWithState,
} from 'pages/stats/common/filters/CustomFieldsFilter'
import {initialState, mergeCustomFieldsFilter} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {FilterKey} from 'models/stat/types'
import {
    getCustomFieldValueSerializer,
    withDefaultCustomFieldAndLogicalOperator,
} from 'models/reporting/queryFactories/utils'

const customFieldId = 123
const filterName = 'Some Custom Field Name'
const defaultState = {
    stats: initialState,
} as RootState

jest.mock('models/customField/queries')
const useGetCustomFieldDefinitionsMock = assumeMock(
    useGetCustomFieldDefinitions
)

const renderComponent = () =>
    renderWithStore(
        <CustomFieldsFilter
            customFieldId={customFieldId}
            filterName={filterName}
        />,
        defaultState
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
        const {store} = renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        expect(store.getActions()).toContainEqual(statFiltersDirty())
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        expect(store.getActions()).toContainEqual(statFiltersClean())
    })

    it('should render Custom Field options', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(customFieldOptions[0])).toBeInTheDocument()
        expect(screen.getByText(customFieldOptions[1])).toBeInTheDocument()
    })

    it('should dispatch mergeCustomFieldsFilter action on selecting a custom field', () => {
        const {store} = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(customFieldOptions[0]))
        userEvent.click(screen.getByText(customFieldOptions[1]))

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: [
                    getCustomFieldValueSerializer(customFieldId)(
                        customFieldOptions[0]
                    ),
                ],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: [
                    getCustomFieldValueSerializer(customFieldId)(
                        customFieldOptions[1]
                    ),
                ],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
    })

    it('should dispatch mergeCustomFieldsFilter action on deselecting a custom field', () => {
        const {store} = renderWithStore(
            <CustomFieldsFilter
                filterName={filterName}
                customFieldId={customFieldId}
                value={{
                    values: [
                        getCustomFieldValueSerializer(customFieldId)(
                            customFieldOptions[0]
                        ),
                    ],
                    customFieldId,
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
            defaultState
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        userEvent.click(
            screen.getByRole('option', {name: customFieldOptions[0]})
        )

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
    })

    it('should dispatch mergeCustomFieldsFilter action on selecting all integrations and deselecting all integrations', () => {
        const {rerender, store} = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption)
        )

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: allAvailableCustomFields,
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )

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
                />
            </Provider>
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
    })

    it('should dispatch mergeCustomFieldsFilter action on deselecting one of the custom fields', () => {
        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption)
        )
        const {store} = renderWithStore(
            <CustomFieldsFilter
                customFieldId={customFieldId}
                filterName={filterName}
                value={{
                    values: allAvailableCustomFields,
                    customFieldId,
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
            defaultState
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        userEvent.click(
            screen.getByRole('option', {name: customFieldOptions[0]})
        )

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: allAvailableCustomFields.filter(
                    (field) =>
                        field !==
                        getCustomFieldValueSerializer(customFieldId)(
                            customFieldOptions[0]
                        )
                ),
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption)
        )
        const {store} = renderWithStore(
            <CustomFieldsFilter
                customFieldId={customFieldId}
                filterName={filterName}
                value={{
                    values: allAvailableCustomFields,
                    customFieldId,
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        const {store, rerender} = renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(
            screen.getByLabelText(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF]
            )
        )

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: [],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            })
        )

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
                />
            </Provider>
        )

        userEvent.click(
            screen.getByLabelText(
                LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]
            )
        )

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId,
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
    })

    it('should not break if customfFieldId is not found', () => {
        const allAvailableCustomFields = customFieldOptions.map(
            (customFieldOption) =>
                getCustomFieldValueSerializer(customFieldId)(customFieldOption)
        )
        const wrongId = 122
        const {store} = renderWithStore(
            <CustomFieldsFilter
                customFieldId={wrongId}
                filterName={filterName}
                value={withDefaultCustomFieldAndLogicalOperator({
                    customFieldId,
                    values: allAvailableCustomFields,
                })}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(store.getActions()).toContainEqual(
            mergeCustomFieldsFilter({
                customFieldId: wrongId,
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        )
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
    it('should render CustomFieldsFilter and select an option from redux state by default', () => {
        renderWithStore(
            <CustomFieldsFilterFilterWithState
                customFieldId={customFieldId}
                filterName={filterName}
            />,
            customFieldsState
        )
        expect(
            screen.queryByText(FILTER_VALUE_PLACEHOLDER)
        ).not.toBeInTheDocument()
        expect(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        ).toBeInTheDocument()
        expect(
            screen.queryByText(customFieldOptions[0])
        ).not.toBeInTheDocument()
        expect(screen.getByText(customFieldOptions[1])).toBeInTheDocument()
    })
})
