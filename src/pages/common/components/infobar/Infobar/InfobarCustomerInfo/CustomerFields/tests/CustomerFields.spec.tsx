import {render, screen} from '@testing-library/react'
import React from 'react'

import {useFlag} from 'common/flags'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {useCustomFieldValues} from 'custom-fields/hooks/queries/useCustomFieldValues'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import {customerInputFieldDefinition} from 'fixtures/customField'
import {assumeMock} from 'utils/testing'

import CustomerField from '../CustomerField'
import CustomerFields from '../CustomerFields'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
jest.mock('custom-fields/hooks/queries/useCustomFieldValues', () => ({
    useCustomFieldValues: jest.fn(),
}))
jest.mock('../Heading', () => ({
    Heading: () => <div>Heading</div>,
}))
jest.mock('../CustomerField', () => {
    return jest.fn(() => <div>CustomerField</div>)
})

const mockedUseFlag = assumeMock(useFlag)
const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const mockedUseCustomFieldValues = assumeMock(useCustomFieldValues)
const mockedCustomerField = assumeMock(CustomerField)

const firstValue = 'firstValue'
const secondValue = 'secondValue'

const mockedValuesData = [
    {field: customerInputFieldDefinition, value: firstValue},
    {
        field: {...customerInputFieldDefinition, id: 2},
        value: secondValue,
    },
]

describe('CustomerFields', () => {
    beforeEach(() => {
        mockedUseFlag.mockReturnValue(true)
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([
                customerInputFieldDefinition,
            ]),
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)
        mockedUseCustomFieldValues.mockReturnValue({
            data: apiListCursorPaginationResponse(mockedValuesData),
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldValues>)
    })

    it('should return null if isCustomerFieldsEnabled is false', () => {
        mockedUseFlag.mockReturnValue(false)
        const {container} = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's no custom field definitions", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]),
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const {container} = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it('should return null if definitions are loading', () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const {container} = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's an error in definitions' loading", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const {container} = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it('should return null if values are loading', () => {
        mockedUseCustomFieldValues.mockReturnValue({
            data: mockedValuesData,
            isLoading: true,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldValues>)

        const {container} = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's an error in values' loading", () => {
        mockedUseCustomFieldValues.mockReturnValue({
            data: mockedValuesData,
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useCustomFieldValues>)

        const {container} = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it('should render Heading component', () => {
        render(<CustomerFields customerId={1} />)

        expect(screen.getByText('Heading')).toBeInTheDocument()
    })

    it('should call CustomerField with the right props based on the number of definitions', () => {
        render(<CustomerFields customerId={1} />)

        expect(mockedCustomerField).toHaveBeenCalledTimes(1)
        expect(mockedCustomerField).toHaveBeenCalledWith(
            {
                field: customerInputFieldDefinition,
                value: firstValue,
                customerId: 1,
            },
            {}
        )
    })
})
