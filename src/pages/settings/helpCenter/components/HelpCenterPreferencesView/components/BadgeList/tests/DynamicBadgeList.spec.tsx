import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {LocaleCode} from '../../../../../../../../models/helpCenter/types'

import {DynamicBadgeList} from '../DynamicBadgeList'

const availableList = [
    {
        id: 'en-US' as LocaleCode,
        label: 'English',
        text: 'English',
        value: 'en-US',
    },
    {
        id: 'fr-FR' as LocaleCode,
        label: 'French',
        text: 'French',
        value: 'fr-FR',
    },
    {
        id: 'es-ES' as LocaleCode,
        label: 'Spanish',
        text: 'Spanish',
        value: 'es-ES',
    },
]

const selectedListDataTestIds = ['badge-en', 'badge-fr']
const selectedList = [
    {
        id: 'en-US' as LocaleCode,
        label: 'English',
        text: 'English',
        value: 'en-US',
    },
    {
        id: 'fr-FR' as LocaleCode,
        label: 'French',
        text: 'French',
        value: 'fr-FR',
    },
]

describe('<DynamicBadgeList />', () => {
    it('Displays the entire <availableList> as badges', () => {
        const {getAllByTestId} = render(
            <DynamicBadgeList
                availableList={availableList}
                selectedList={selectedList}
                onSelectItem={jest.fn}
                onRemoveItem={jest.fn}
            />
        )

        expect(getAllByTestId(/badge-*/)).toHaveLength(
            selectedListDataTestIds.length
        )
    })

    it('Displays the add button', () => {
        const {getByText} = render(
            <DynamicBadgeList
                availableList={availableList}
                selectedList={selectedList}
                onSelectItem={jest.fn}
                onRemoveItem={jest.fn}
            />
        )

        getByText('add')
    })

    it('Displays select options without selected items', () => {
        const {getByText} = render(
            <DynamicBadgeList
                availableList={availableList}
                selectedList={selectedList}
                onSelectItem={jest.fn}
                onRemoveItem={jest.fn}
            />
        )

        const button = getByText('add')

        userEvent.click(button)

        expect(screen.getAllByRole('menuitem')).toHaveLength(1)
        screen.getByText('Spanish')
    })
})
