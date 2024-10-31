import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import Deprecated_MultiLevelSelect from '../Deprecated_MultiLevelSelect'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(() => ({
        role: {name: 'admin'},
    })),
}))

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

const renderComponent = (props = {}) => {
    return render(
        <Deprecated_MultiLevelSelect
            id={1}
            inputId="test-input-id"
            onChange={jest.fn()}
            choices={['s1::a1', 's1::ss2::c1', 's1::ss2::c2', 's1::ss3', 's2']}
            values={[]}
            isOpen
            onToggle={jest.fn()}
            onApplyClick={jest.fn()}
            {...props}
        >
            Hello world
        </Deprecated_MultiLevelSelect>
    )
}

describe('Deprecated_MultiLevelSelect', () => {
    it('should display all the items when focused and allow mouse navigation', () => {
        const {getByText} = renderComponent({})

        let navItem = getByText('s1')
        expect(getByText('s2'))
        // forth
        fireEvent.click(navItem)
        expect(getByText('a1'))
        navItem = getByText('s1')
        // and back
        fireEvent.click(navItem)
        expect(getByText('s2'))
    })

    it('should render search', async () => {
        const {getByText, getByPlaceholderText} = renderComponent({})

        await waitFor(() => {
            const inputElement = getByPlaceholderText('Search')
            fireEvent.change(inputElement, {
                target: {value: 'help center article'},
            })

            expect(inputElement).toHaveValue('help center article')

            expect(getByText('No results')).toBeInTheDocument()
        })
    })

    it('should display results when searching', async () => {
        const {getByPlaceholderText, getAllByText} = renderComponent({})

        await waitFor(() => {
            const inputElement = getByPlaceholderText('Search')
            fireEvent.change(inputElement, {
                target: {value: 's1'},
            })

            expect(getAllByText('s1')[0]).toBeInTheDocument()
            expect(getAllByText('a1')[0]).toBeInTheDocument()
            expect(getAllByText('c1')[0]).toBeInTheDocument()
            expect(getAllByText('c2')[0]).toBeInTheDocument()
            expect(getAllByText('ss3')[0]).toBeInTheDocument()
        })
    })
})
