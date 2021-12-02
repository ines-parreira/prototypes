import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'

import ButtonsGroup from '../ButtonsGroup'

describe('<ButtonsGroup/>', () => {
    const buttons = [
        {label: '{{label_0}}'},
        {label: 'ok'},
        {label: '{{label_1}}'},
        {label: 'who cares'},
    ]

    const _source = {
        label_0: 'renders',
        label_1: 'renders inside dropdow',
    }

    const source = fromJS(_source)

    it('should render with correct label and without a dropdown ', () => {
        const {container} = render(
            <ButtonsGroup buttons={buttons.slice(0, 2)} source={source} />
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(screen.queryByText(_source.label_0)).toBeTruthy()
        expect(screen.queryByText('more_horiz')).toBeFalsy()
    })

    it('should render with a dropdown', () => {
        render(<ButtonsGroup buttons={buttons} source={source} />)
        expect(screen.queryByText('more_horiz')).toBeTruthy()
        expect(screen.queryByRole('menu')).toBeFalsy()
    })

    it('should show button in dropdown on click, with correct label', () => {
        render(<ButtonsGroup buttons={buttons} source={source} />)
        expect(screen.queryByRole('menu')).toBeFalsy()
        fireEvent.click(screen.getByText('more_horiz'))
        expect(screen.getByRole('menu').getAttribute('aria-hidden')).toBe(
            'false'
        )
        expect(screen.queryByText(_source.label_1)).toBeTruthy()
    })
})
