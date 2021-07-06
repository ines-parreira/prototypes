import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {ArticleLanguageSelect} from '../ArticleLanguageSelect'

const list = [
    {value: 'en-US', label: 'English'},
    {value: 'fr-FR', label: 'French'},
    {
        value: 'de-DE',
        label: 'German',
        isComplete: true,
    },
    {value: 'es-ES', label: 'Spanish'},
]

describe('<ArticleLanguageSelect>', () => {
    it('opens the dropdown options', () => {
        const {getByTestId, getByRole} = render(
            <ArticleLanguageSelect
                selected="en-US"
                list={list}
                onSelect={() => null}
            />
        )

        fireEvent.click(getByRole('button'))

        getByTestId('dropdown-options')
    })

    it('renders all the options', () => {
        const {getByRole, getByTestId} = render(
            <ArticleLanguageSelect
                selected="en-US"
                list={list}
                onSelect={() => null}
            />
        )

        fireEvent.click(getByRole('button'))

        list.forEach((option) => {
            getByTestId(`option-${option.value}`)
        })
    })

    it('calls the onSelect callback with selected value', () => {
        const selectFn = jest.fn()

        const {getByTestId, getByRole} = render(
            <ArticleLanguageSelect
                selected="en-US"
                list={list}
                onSelect={selectFn}
            />
        )
        fireEvent.click(getByRole('button'))

        fireEvent.click(getByTestId('option-fr-FR'))

        expect(selectFn).toHaveBeenCalled()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(selectFn.mock.calls[0][1]).toEqual('fr-FR')
    })
})
