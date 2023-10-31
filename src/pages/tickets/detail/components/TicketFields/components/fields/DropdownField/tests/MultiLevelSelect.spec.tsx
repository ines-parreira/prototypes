import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MultiLevelSelect from '../MultiLevelSelect'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('<MultiLevelSelect />', () => {
    const initialProps = {
        id: 1,
        label: 'dropdown',
        value: 's1::ss2::c2',
        hasError: false,
        choices: ['s1::ss1', 's1::ss2::c1', 's1::ss2::c2', 's1::ss3', 's2'],
        inputId: 'test-input-id',
        isRequired: true,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        initialProps.onChange.mockReset()
    })

    it('should render the dropdown component correctly', () => {
        const props = {
            ...initialProps,
            choices: [
                'Option 1',
                'Option 2',
                `Option 3::Sub 2::Sub 3::Sub 4::Sub 5`,
                0,
                1,
                123,
                true,
                false,
                {foo: 'bar'}, // this should be ignored with no errors as we are not supporting objects
            ],
        }
        /* @ts-ignore - we are testing an unsupported object */
        render(<MultiLevelSelect {...props} />)

        userEvent.click(screen.getByRole('textbox'))
        expect(document.body).toMatchSnapshot()
    })

    it('should display all the items when focused and allow mouse navigation', () => {
        render(<MultiLevelSelect {...initialProps} value="" />)

        userEvent.click(screen.getByRole('textbox'))
        let navItem = screen.getByText('s1')
        expect(screen.getByText('s2'))
        // forth
        userEvent.click(navItem)
        expect(screen.getByText('ss1'))
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

    it('should display display results when searching', async () => {
        const {container} = render(<MultiLevelSelect {...initialProps} />)

        userEvent.click(screen.getByRole('textbox'))
        await userEvent.type(screen.getByPlaceholderText('Search'), 's1')
        expect(container.parentElement).toMatchSnapshot()
    })
})
