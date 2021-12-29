import React from 'react'
import {render, screen} from '@testing-library/react'

import ArticleCategorySelect from '../ArticleCategorySelect'
import useCategoriesOptions from '../hooks/useCategoriesOptions'

jest.mock('../hooks/useCategoriesOptions')

describe('<ArticleCategorySelect />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {label: '- No category -', value: 'null'},
            {label: 'Orders', value: 1},
            {label: 'Pricing', value: 2},
        ])
    })

    it('should display the category options on the screen', async () => {
        render(
            <ArticleCategorySelect
                locale="en-US"
                helpCenterId={1}
                categoryId={1}
            />
        )
        await screen.findByText('- No category -')
        await screen.findByText('Orders')
        await screen.findByText('Pricing')
    })

    it('should show new options if locale changed', async () => {
        const {rerender} = render(
            <ArticleCategorySelect
                locale="en-US"
                helpCenterId={1}
                categoryId={1}
            />
        )
        await screen.findByText('Orders')
        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {label: '- No category -', value: 'null'},
            {label: 'Commandes', value: 1},
            {label: 'Prix', value: 2},
        ])
        rerender(
            <ArticleCategorySelect
                locale="fr-FR"
                helpCenterId={1}
                categoryId={1}
            />
        )
        await screen.findByText('Commandes')
    })
})
