import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {DynamicBadgeList} from '../DynamicBadgeList'

const availableList = [
    {id: 'en', label: 'English', text: 'English', value: 'en'},
    {id: 'fr', label: 'French', text: 'French', value: 'fr'},
    {id: 'es', label: 'Spanish', text: 'Spanish', value: 'es'},
]

const selectedListDataTestIds = ['badge-en', 'badge-fr']
const selectedList = [
    {id: 'en', label: 'English', text: 'English', value: 'en'},
    {id: 'fr', label: 'French', text: 'French', value: 'fr'},
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
