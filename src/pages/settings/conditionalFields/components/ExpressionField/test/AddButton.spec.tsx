import {CustomFieldConditionExpression} from '@gorgias/api-queries'
import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'
import {useWatch} from 'react-hook-form'

import {assumeMock} from 'utils/testing'

import {AddButton} from '../AddButton'

jest.mock(
    'react-hook-form',
    () =>
        ({
            ...jest.requireActual('react-hook-form'),
            useWatch: jest.fn(),
        }) as Record<string, unknown>
)

const useWatchMock = assumeMock(useWatch)

describe('AddButton', () => {
    beforeEach(() => {
        useWatchMock.mockReturnValue([])
    })

    const defaultProps = {
        onClick: jest.fn(),
    }

    it('should call `watch` with correct params', () => {
        render(<AddButton {...defaultProps} />)
        expect(useWatchMock).toHaveBeenCalledTimes(1)
        expect(useWatchMock).toHaveBeenCalledWith({name: 'expression'})
    })

    it('should render button not disabled', () => {
        render(<AddButton {...defaultProps} />)

        const button = screen.getByText('Add requirements')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeAriaDisabled()
    })

    it('should render button disabled', () => {
        useWatchMock.mockReturnValue([
            {field: 1},
            {field: 0},
        ] as CustomFieldConditionExpression[])

        render(<AddButton {...defaultProps} />)

        const button = screen.getByText('Add requirements')
        expect(button).toBeAriaDisabled()
    })

    it('should call onClick', () => {
        render(<AddButton {...defaultProps} />)

        const button = screen.getByText('Add requirements')
        fireEvent.click(button)

        expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    })
})
