import {render} from '@testing-library/react'
import React from 'react'

import {useFlag} from 'common/flags'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import {assumeMock} from 'utils/testing'

import {customerInputFieldDefinition} from 'fixtures/customField'
import CustomerFields from '../CustomerFields'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
jest.mock('../Heading', () => ({
    Heading: () => <div>Heading</div>,
}))

const mockedUseFlag = assumeMock(useFlag)
const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)

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
    })

    it('should return null if isCustomerFieldsEnabled is false', () => {
        mockedUseFlag.mockReturnValue(false)
        const {container} = render(<CustomerFields />)

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's no custom fields", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]),
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const {container} = render(<CustomerFields />)

        expect(container.firstChild).toBeNull()
    })

    it('should return null if loading', () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const {container} = render(<CustomerFields />)

        expect(container.firstChild).toBeNull()
    })

    it("should return null if there's an error", () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        const {container} = render(<CustomerFields />)

        expect(container.firstChild).toBeNull()
    })

    it('should render Heading component', () => {
        const {getByText} = render(<CustomerFields />)

        expect(getByText('Heading')).toBeInTheDocument()
    })

    it('should render custom fields', () => {
        const {getByText} = render(<CustomerFields />)

        expect(
            getByText(customerInputFieldDefinition.label)
        ).toBeInTheDocument()
    })
})
