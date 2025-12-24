import React from 'react'

import { useWatch } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import type { CustomFieldConditionExpression } from '@gorgias/helpdesk-queries'

import { AddButton } from '../AddButton'

jest.mock(
    '@repo/forms',
    () =>
        ({
            ...jest.requireActual('@repo/forms'),
            useWatch: jest.fn(),
        }) as Record<string, unknown>,
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
        expect(useWatchMock).toHaveBeenCalledWith({ name: 'expression' })
    })

    it('should render button not disabled', () => {
        render(<AddButton {...defaultProps} />)

        const button = screen.getByText('Add requirements')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeAriaDisabled()
    })

    it('should render button disabled', () => {
        useWatchMock.mockReturnValue([
            { field: 1 },
            { field: 0 },
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
