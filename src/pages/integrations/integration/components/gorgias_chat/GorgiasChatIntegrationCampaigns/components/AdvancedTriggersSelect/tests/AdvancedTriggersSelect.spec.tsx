import React from 'react'
import {act} from 'react-dom/test-utils'
import {fireEvent, render} from '@testing-library/react'

import {AdvancedTriggersSelect} from '../AdvancedTriggersSelect'

describe('<AdvancedTriggersSelect />', () => {
    it('triggers the onClick with the right trigger key', () => {
        const onClickFn = jest.fn()

        const {getByText} = render(
            <AdvancedTriggersSelect onClick={onClickFn} />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        act(() => {
            fireEvent.click(getByText('Current URL'))
        })

        expect(onClickFn).toBeCalledWith('current_url')
    })

    it('renders the legacy triggers', () => {
        const onClickFn = jest.fn()

        const {getByText} = render(
            <AdvancedTriggersSelect onClick={onClickFn} />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        getByText('Current URL')
        getByText('Time spent on page')
    })

    it('renders the legacy and revenue triggers', () => {
        const onClickFn = jest.fn()

        const {getByText} = render(
            <AdvancedTriggersSelect isRevenueBetaTester onClick={onClickFn} />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        getByText('Business hours')
        getByText('Current URL')
        getByText('Time spent on page')
    })
})
