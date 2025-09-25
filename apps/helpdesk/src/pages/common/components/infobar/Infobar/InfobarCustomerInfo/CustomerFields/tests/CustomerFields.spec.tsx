import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { ListCustomFields200 } from '@gorgias/helpdesk-queries'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { customerInputFieldDefinition } from 'fixtures/customField'

import CustomerField from '../CustomerField'
import CustomerFields from '../CustomerFields'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
jest.mock('../Heading', () => ({
    Heading: () => <div>Heading</div>,
}))
jest.mock('../CustomerField', () => {
    return jest.fn(() => <div>CustomerField</div>)
})

const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const mockedCustomerField = assumeMock(CustomerField)

const firstValue = 'firstValue'
const secondValue = 'secondValue'

const mockedValuesData = [
    {
        id: customerInputFieldDefinition.id,
        value: firstValue,
    },
    {
        id: 2,
        value: secondValue,
    },
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
    })

    it("should return null if there's no custom field definitions", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]) as ListCustomFields200,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useCustomFieldDefinitions>)

        const { container } = render(
            <CustomerFields customerId={1} values={[]} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null if definitions are loading', () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const { container } = render(
            <CustomerFields customerId={1} values={[]} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's an error in definitions' loading", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const { container } = render(
            <CustomerFields customerId={1} values={[]} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render Heading component', () => {
        render(<CustomerFields customerId={1} values={[]} />)

        expect(screen.getByText('Heading')).toBeInTheDocument()
    })

    it('should call CustomerField with the right props based on the number of definitions', () => {
        render(<CustomerFields customerId={1} values={mockedValuesData} />)

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
