import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { BadgeItemProps } from 'pages/common/components/BadgetItem'

import { BadgeSelectItem, DynamicBadgeList } from '../DynamicBadgeList'

const availableList: BadgeSelectItem[] = [
    { id: 'en-US', label: 'English', text: 'English', value: 'en' },
    { id: 'fr-FR', label: 'French', text: 'French', value: 'fr' },
    { id: 'es-ES', label: 'Spanish', text: 'Spanish', value: 'es' },
]

const selectedListDataTestIds = ['badge-en', 'badge-fr']
const selectedList: BadgeItemProps[] = [
    { id: 'en-US', label: 'English' },
    { id: 'fr-FR', label: 'French' },
]

describe('<DynamicBadgeList />', () => {
    it('Displays the entire <availableList> as badges', () => {
        const { getAllByTestId } = render(
            <DynamicBadgeList
                availableList={availableList}
                selectedList={selectedList}
                onSelectItem={jest.fn}
                onRemoveItem={jest.fn}
            />,
        )

        expect(getAllByTestId(/badge-*/)).toHaveLength(
            selectedListDataTestIds.length,
        )
    })

    it('Displays the add button', () => {
        const { getByText } = render(
            <DynamicBadgeList
                availableList={availableList}
                selectedList={selectedList}
                onSelectItem={jest.fn}
                onRemoveItem={jest.fn}
            />,
        )

        getByText('add')
    })

    it('Displays select options without selected items', () => {
        const { getByText } = render(
            <DynamicBadgeList
                availableList={availableList}
                selectedList={selectedList}
                onSelectItem={jest.fn}
                onRemoveItem={jest.fn}
            />,
        )

        const button = getByText('add')

        userEvent.click(button)

        expect(screen.getAllByRole('menuitem')).toHaveLength(1)
        screen.getByText('Spanish')
    })
})
