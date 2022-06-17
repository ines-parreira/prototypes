import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as helpCenterState} from 'state/entities/helpCenter/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import ArticleCategorySelect from '../ArticleCategorySelect'
import useCategoriesOptions from '../hooks/useCategoriesOptions'

jest.mock('../hooks/useCategoriesOptions')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: helpCenterState,
    } as any,
    ui: {helpCenter: uiState} as any,
}

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
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="en-US" categoryId={1} />
            </Provider>
        )
        await screen.findByText('- No category -')
        await screen.findByText('Orders')
        await screen.findByText('Pricing')
    })

    it('should show new options if locale changed', async () => {
        const {rerender} = render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="en-US" categoryId={1} />
            </Provider>
        )
        await screen.findByText('Orders')
        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {label: '- No category -', value: 'null'},
            {label: 'Commandes', value: 1},
            {label: 'Prix', value: 2},
        ])
        rerender(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="fr-FR" categoryId={1} />
            </Provider>
        )
        await screen.findByText('Commandes')
    })
})
