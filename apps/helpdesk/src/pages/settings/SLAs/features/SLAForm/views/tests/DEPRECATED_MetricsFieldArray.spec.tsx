import React from 'react'

import { useController, useFieldArray, useFormContext } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import MetricsFieldArray from '../DEPRECATED_MetricsFieldArray'

const useFieldArrayMock = assumeMock(useFieldArray)
const useControllerMock = assumeMock(useController)
const useFormContextMock = assumeMock(useFormContext)

useFieldArrayMock.mockReturnValue({
    fields: [
        { id: '1', name: 'FRT' },
        { id: '2', name: 'RT' },
    ],
} as unknown as ReturnType<typeof useFieldArray>)

useControllerMock.mockReturnValue({
    field: {},
    fieldState: { error: { message: 'error' } },
} as unknown as ReturnType<typeof useController>)

useFormContextMock.mockReturnValue({
    setValue: jest.fn(),
    getValues: jest.fn(),
} as unknown as ReturnType<typeof useFormContext>)

jest.mock('@repo/forms', () => ({
    ...jest.requireActual('@repo/forms'),
    useFieldArray: jest.fn(),
    useController: jest.fn(),
    useFormContext: jest.fn(),
    FormField: jest.fn(({ name }) => <div>{name}</div>),
}))

describe('<MetricsFieldArray />', () => {
    it('should render a field for each metric', () => {
        render(<MetricsFieldArray />)

        expect(screen.getByText('First response time')).toBeInTheDocument()
        expect(screen.getByText('Resolution time')).toBeInTheDocument()
    })
})
