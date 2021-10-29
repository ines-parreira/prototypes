import React from 'react'
import {render, screen} from '@testing-library/react'

import ArticleCategorySelect from '../ArticleCategorySelect'

import {useHelpCenterApi} from '../../../../hooks/useHelpCenterApi'

jest.mock('../../../../hooks/useHelpCenterApi')

describe('<ArticleCategorySelect />', () => {
    let listCategoriesMock: jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()
        listCategoriesMock = jest.fn().mockImplementation(() => ({
            data: {
                data: [
                    {id: 1, translation: {title: 'Hello'}},
                    {id: 2, translation: {title: 'Bar'}},
                ],
            },
        }))
        ;(useHelpCenterApi as jest.Mock).mockImplementation(() => ({
            client: {
                listCategories: listCategoriesMock,
            },
        }))
    })

    it('should show selected option based on API response', async () => {
        render(
            <ArticleCategorySelect
                locale="en-US"
                helpCenterId={1}
                categoryId={1}
            />
        )

        await screen.findByText('Hello')
    })

    it('should show new options if locale changed', async () => {
        const {rerender} = render(
            <ArticleCategorySelect
                locale="en-US"
                helpCenterId={1}
                categoryId={1}
            />
        )
        await screen.findByText('Hello')
        ;(useHelpCenterApi as jest.Mock).mockImplementation(() => ({
            client: {
                listCategories: () => ({
                    data: {
                        data: [
                            {id: 1, translation: {title: 'Bonjour'}},
                            {id: 2, translation: {title: 'Bar'}},
                        ],
                    },
                }),
            },
        }))
        rerender(
            <ArticleCategorySelect
                locale="fr-FR"
                helpCenterId={1}
                categoryId={1}
            />
        )
        await screen.findByText('Bonjour')
    })
})
