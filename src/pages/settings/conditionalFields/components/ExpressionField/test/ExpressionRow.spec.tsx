import {ExpressionOperator} from '@gorgias/api-queries'
import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import {FormField, useWatch} from 'core/forms'
import {CustomField} from 'custom-fields/types'
import {assumeMock} from 'utils/testing'

import {ExpressionRow} from '../ExpressionRow'
import {FieldField} from '../FieldField'
import {OperatorField} from '../OperatorField'
import {ValueField} from '../ValueField'

jest.mock(
    'core/forms',
    () =>
        ({
            ...jest.requireActual('core/forms'),
            useWatch: jest.fn(),
            FormField: jest.fn(() => <div />),
        }) as Record<string, unknown>
)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))

const useWatchMock = assumeMock(useWatch)

describe('ExpressionRow', () => {
    const definitions = [{id: 1}, {id: 2}] as CustomField[]

    beforeEach(() => {
        useWatchMock.mockReturnValue([1, ExpressionOperator.Is])
    })

    const defaultProps = {
        index: 1,
        customFieldDefinitions: definitions,
        onRemove: jest.fn(),
    }

    it('should call `watch` with correct params', () => {
        render(<ExpressionRow {...defaultProps} />)
        expect(useWatchMock).toHaveBeenCalledTimes(1)
        expect(useWatchMock).toHaveBeenCalledWith({
            name: ['expression.1.field', 'expression.1.operator'],
        })
    })

    it("should render Pills, and 'And' when index is greater than 0", () => {
        const {rerender} = render(<ExpressionRow {...defaultProps} />)

        expect(screen.getByText('Ticket Field')).toBeInTheDocument()
        expect(screen.getByText('And')).toBeInTheDocument()

        rerender(<ExpressionRow {...defaultProps} index={0} />)

        expect(screen.queryByText('And')).toBeNull()
    })

    it('should call FormField with correct props', () => {
        render(<ExpressionRow {...defaultProps} />)

        expect(FormField).toHaveBeenCalledTimes(3)
        expect(FormField).toHaveBeenNthCalledWith(
            1,
            {
                name: 'expression.1.field',
                index: 1,
                field: FieldField,
                customFieldDefinitions: definitions,
            },
            {}
        )
        expect(FormField).toHaveBeenNthCalledWith(
            2,
            {
                name: 'expression.1.operator',
                field: OperatorField,
                pickedDefinition: defaultProps.customFieldDefinitions[0],
            },
            {}
        )
        expect(FormField).toHaveBeenNthCalledWith(
            3,
            {
                name: 'expression.1.values',
                index: 1,
                field: ValueField,
                pickedDefinition: defaultProps.customFieldDefinitions[0],
                isRequired: true,
                isDisabled: false,
            },
            {}
        )
    })

    it('should call `onRemove` when clicking "close"', () => {
        render(<ExpressionRow {...defaultProps} />)

        const closeIcon = screen.getByText('close')
        fireEvent.click(closeIcon)
        expect(defaultProps.onRemove).toHaveBeenCalledWith(defaultProps.index)
    })
})
