import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {ArticleLanguageSelect, OptionItem} from '../ArticleLanguageSelect'

const list: OptionItem[] = [
    {value: 'en-US', label: 'English', text: 'English', canBeDeleted: false},
    {value: 'fr-FR', label: 'French', text: 'French'},
    {
        value: 'de-DE',
        label: 'German',
        text: 'German',
        isComplete: true,
    },
    {value: 'es-ES', label: 'Spanish', text: 'Spanish'},
]

describe('<ArticleLanguageSelect>', () => {
    it('opens the dropdown options', () => {
        const {getByTestId, getByRole} = render(
            <ArticleLanguageSelect
                selected="en-US"
                list={list}
                onSelect={() => null}
                onClickAction={() => null}
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
                onClickAction={() => null}
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
                onClickAction={() => null}
            />
        )
        fireEvent.click(getByRole('button'))

        fireEvent.click(getByTestId('option-fr-FR'))

        expect(selectFn).toHaveBeenCalled()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(selectFn.mock.calls[0][0]).toEqual('fr-FR')
    })

    it('shows the create button if locale is not created', () => {
        const mock: OptionItem[] = [
            {
                value: 'en-US',
                label: 'English',
                text: 'English',
            },
        ]
        const {getByRole, getByText} = render(
            <ArticleLanguageSelect
                selected="en-US"
                list={mock}
                onSelect={() => null}
                onClickAction={() => null}
            />
        )

        fireEvent.click(getByRole('button'))

        getByText('create')
    })

    it('shows the delete and view button if locale is complete', () => {
        const mock: OptionItem[] = [
            {
                value: 'en-US',
                label: 'English',
                text: 'English',
                isComplete: true,
                canBeDeleted: true,
            },
        ]
        const {getByRole, getByText} = render(
            <ArticleLanguageSelect
                selected="en-US"
                list={mock}
                onSelect={() => null}
                onClickAction={() => null}
            />
        )

        fireEvent.click(getByRole('button'))

        getByText('delete')
        getByText('view')
    })

    it('hides the delete button if locale cannot be deleted', () => {
        const mock: OptionItem[] = [
            {
                value: 'en-US',
                label: 'English',
                text: 'English',
                canBeDeleted: false,
                isComplete: true,
            },
        ]
        const {getByRole, getByText, queryByText} = render(
            <ArticleLanguageSelect
                selected="en-US"
                list={mock}
                onSelect={() => null}
                onClickAction={() => null}
            />
        )

        fireEvent.click(getByRole('button'))

        expect(queryByText('delete')).toBeNull()
        getByText('view')
    })
})
