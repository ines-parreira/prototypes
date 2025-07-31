import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    ticketFieldDefinitions,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import useAppDispatch from 'hooks/useAppDispatch'
import { getDefaultCustomFieldOperator } from 'pages/common/components/ViewTable/Filters/utils'
import { updateCustomFieldFilterId } from 'state/views/actions'

import useCustomFieldsFilters from '../useCustomFieldsFilters'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = useCustomFieldDefinition as jest.Mock

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = useCustomFieldDefinitions as jest.Mock

jest.mock('state/views/actions')
const updateCustomFieldFilterIdMock = updateCustomFieldFilterId as jest.Mock

jest.mock('pages/common/components/ViewTable/Filters/utils')
const getDefaultCustomFieldOperatorMock =
    getDefaultCustomFieldOperator as jest.Mock

describe('useCustomFieldsFilters', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: false,
        } as any)

        useCustomFieldDefinitionMock.mockReturnValue({
            data: ticketInputFieldDefinition,
            isLoading: false,
        } as any)

        useAppDispatchMock.mockReturnValue(jest.fn())
    })

    it('should return the active custom fields', () => {
        const { result } = renderHook(() =>
            useCustomFieldsFilters({
                objectPath: 'ticket.custom_fields[123].value',
                index: 0,
                schemas: fromJS({}),
            }),
        )

        expect(result.current.activeCustomFields).toEqual(
            ticketFieldDefinitions,
        )
    })

    it('should return the custom field corresponding to the object path', () => {
        const { result } = renderHook(() =>
            useCustomFieldsFilters({
                objectPath: 'ticket.custom_fields[123].value',
                index: 0,
                schemas: fromJS({}),
            }),
        )

        expect(result.current.customField).toEqual(ticketInputFieldDefinition)
    })

    it('should call updateCustomFieldFilterId when onCustomFieldChange is called', () => {
        getDefaultCustomFieldOperatorMock.mockReturnValue('eq')

        const { result } = renderHook(() =>
            useCustomFieldsFilters({
                objectPath: 'ticket.custom_fields[123].value',
                index: 0,
                schemas: fromJS({}),
            }),
        )

        result.current.onCustomFieldChange(2)

        expect(updateCustomFieldFilterIdMock).toHaveBeenCalledWith(0, 2, 'eq')
    })
})
