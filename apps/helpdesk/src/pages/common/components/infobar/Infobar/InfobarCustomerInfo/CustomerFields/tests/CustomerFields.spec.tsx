import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import {
    CustomerCustomFieldWithValue,
    ListCustomerCustomFieldsValues200,
    ListCustomFields200,
} from '@gorgias/helpdesk-queries'

import { useCustomerFieldValues } from 'custom-fields/hooks/queries/useCustomerFieldValues'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { customerInputFieldDefinition } from 'fixtures/customField'

import CustomerField from '../CustomerField'
import CustomerFields from '../CustomerFields'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
jest.mock('custom-fields/hooks/queries/useCustomerFieldValues', () => ({
    useCustomerFieldValues: jest.fn(),
}))
jest.mock('../Heading', () => ({
    Heading: () => <div>Heading</div>,
}))
jest.mock('../CustomerField', () => {
    return jest.fn(() => <div>CustomerField</div>)
})

const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const mockedUseCustomerFieldValues = assumeMock(useCustomerFieldValues)
const mockedCustomerField = assumeMock(CustomerField)

const firstValue = 'firstValue'
const secondValue = 'secondValue'

const mockedValuesData = [
    {
        field: customerInputFieldDefinition,
        value: firstValue,
    } as CustomerCustomFieldWithValue,
    {
        field: { ...customerInputFieldDefinition, id: 2 },
        value: secondValue,
    } as CustomerCustomFieldWithValue,
]

describe('CustomerFields', () => {
    beforeEach(() => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([
                customerInputFieldDefinition,
            ]) as ListCustomFields200,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useCustomFieldDefinitions>)
        mockedUseCustomerFieldValues.mockReturnValue({
            data: apiListCursorPaginationResponse(
                mockedValuesData,
            ) as ListCustomerCustomFieldsValues200,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useCustomerFieldValues>)
    })

    it("should return null if there's no custom field definitions", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]) as ListCustomFields200,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useCustomFieldDefinitions>)

        const { container } = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it('should return null if definitions are loading', () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const { container } = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's an error in definitions' loading", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const { container } = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it('should return null if values are loading', () => {
        mockedUseCustomerFieldValues.mockReturnValue({
            data: apiListCursorPaginationResponse(
                mockedValuesData,
            ) as ListCustomerCustomFieldsValues200,
            isLoading: true as false,
            isError: false,
        } as ReturnType<typeof useCustomerFieldValues>)

        const { container } = render(<CustomerFields customerId={1} />)

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's an error in values' loading", () => {
        mockedUseCustomerFieldValues.mockReturnValue({
            data: apiListCursorPaginationResponse(
                mockedValuesData,
            ) as ListCustomerCustomFieldsValues200,
            isLoading: false,
            isError: true,
        } as ReturnType<typeof useCustomerFieldValues>)

        const { container } = render(<CustomerFields customerId={1} />)

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
            {},
        )
    })
})
