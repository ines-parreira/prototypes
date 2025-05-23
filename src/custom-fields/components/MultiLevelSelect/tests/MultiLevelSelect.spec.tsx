import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import { hasRole } from 'utils'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import MultiLevelSelect from '../MultiLevelSelect'

jest.mock('utils', () => {
    {
        const originalModule = jest.requireActual('utils')
        return {
            ...originalModule,
            hasRole: jest.fn(),
        } as Record<string, unknown>
    }
})
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(() => ({
        role: { name: 'admin' },
    })),
}))

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)
const mockedHasRole = assumeMock(hasRole)

describe('<MultiLevelSelect />', () => {
    const initialProps = {
        id: 1,
        label: 'dropdown',
        value: 's1::ss2::c2',
        hasError: false,
        choices: [
            's1::a1',
            's1::ss2::c1',
            's1::ss2::c2',
            's1::ss3',
            's2',
            's3',
        ],
        inputId: 'test-input-id',
        isRequired: true,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        mockedHasRole.mockReturnValue(false)
        initialProps.onChange.mockReset()
    })

    it('should display all the items when focused and allow mouse navigation', () => {
        render(<MultiLevelSelect {...initialProps} value="" />)

        userEvent.click(screen.getByRole('textbox'))
        let navItem = screen.getByText('s1')
        expect(screen.getByText('s2'))
        // forth
        userEvent.click(navItem)
        expect(screen.getByText('a1'))
        navItem = screen.getByText('s1')
        // and back
        userEvent.click(navItem)
        expect(screen.getByText('s2'))
    })

    it('should call onChange with correct params and dismiss modal when selecting a value', () => {
        render(<MultiLevelSelect {...initialProps} />)

        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText('c1'))
        expect(initialProps.onChange).toHaveBeenCalledWith('s1::ss2::c1')
        expect(screen.queryByTestId('floating-overlay')).toBe(null)
    })

    it('should call onChange with correct params and dismiss modal when clearing the value', () => {
        render(<MultiLevelSelect {...initialProps} />)

        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText(/Clear/))
        expect(initialProps.onChange).toHaveBeenCalledWith('')
        expect(screen.queryByTestId('floating-overlay')).toBe(null)
    })

    it('should not display a search input if not text choices', () => {
        render(<MultiLevelSelect {...initialProps} choices={[1024, 2048]} />)

        userEvent.click(screen.getByRole('textbox'))
        expect(screen.queryByPlaceholderText('Search')).toBeNull()
    })

    it('should display results when searching', async () => {
        render(<MultiLevelSelect {...initialProps} />)

        userEvent.click(screen.getByRole('textbox'))
        await userEvent.type(screen.getByPlaceholderText('Search'), 's1')
        expect(screen.getByText('a1')).toBeInTheDocument()
        expect(screen.getByText('c1')).toBeInTheDocument()
        expect(screen.getByText('c2')).toBeInTheDocument()
        expect(screen.getByText('ss3')).toBeInTheDocument()
        expect(screen.queryByText('s2')).not.toBeInTheDocument()
    })

    it('should show a span instead of an input when autoWidth is true', () => {
        render(<MultiLevelSelect {...initialProps} autoWidth />)
        expect(screen.getByText('c2')).toBeVisible()
    })

    it('should show a span placeholder instead of an input when autoWidth is true when value is empty', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                autoWidth
                value=""
                placeholder="placeholder"
            />,
        )
        expect(screen.getByText('placeholder')).toBeVisible()
    })

    it('should render custom display value', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                customDisplayValue={() => 'custom display value'}
            />,
        )
        expect(screen.getByRole('textbox')).toHaveValue('custom display value')
    })

    it('should render multiple values correctly', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                allowMultiValues
                value={['s1::ss2::c1', 's1::ss2::c2']}
            />,
        )

        expect(screen.getByRole('textbox')).toHaveValue(
            's1::ss2::c1,s1::ss2::c2',
        )
    })

    it('should call onChange with correct params when multiple values are selected, and keep textbox open', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                allowMultiValues
                value={['s1::ss2::c2']}
            />,
        )

        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText('s2'))
        expect(initialProps.onChange).toHaveBeenCalledWith([
            's2',
            's1::ss2::c2',
        ])
        userEvent.click(screen.getByText('s3'))
        expect(initialProps.onChange).toHaveBeenCalledWith([
            's3',
            's1::ss2::c2',
        ])
    })

    it('should exclude a value when reselected in multiple mode', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                allowMultiValues
                value={['s2']}
            />,
        )

        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText('s2'))

        expect(initialProps.onChange).toHaveBeenCalledWith([])
    })

    describe('Empty helper', () => {
        it('should display an empty helper when they are no choices', async () => {
            render(<MultiLevelSelect {...initialProps} choices={[]} />)

            userEvent.hover(screen.getByDisplayValue('c2'))
            await waitFor(() => {
                expect(
                    screen.getByText(/This field does not have any values yet/),
                ).toBeInTheDocument()
            })
        })
        it('should display an empty helper specific to admin when there are no choices', async () => {
            mockedHasRole.mockReturnValue(true)
            render(<MultiLevelSelect {...initialProps} choices={[]} />)
            userEvent.hover(screen.getByDisplayValue('c2'))
            await waitFor(() => {
                expect(screen.getByText(/Go to Settings/)).toBeInTheDocument()
            })
        })
    })
})
