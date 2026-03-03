import React from 'react'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { initialState as helpCenterState } from 'state/entities/helpCenter/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import ArticleCategorySelect from '../ArticleCategorySelect'
import useCategoriesOptions from '../hooks/useCategoriesOptions'

jest.mock('../hooks/useCategoriesOptions')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: helpCenterState,
    } as any,
    ui: { helpCenter: uiState } as any,
}

describe('<ArticleCategorySelect />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {
                id: 'no-category',
                value: null,
                label: '- no category -',
                textValue: '- no category -',
            },
            {
                id: 'category-1',
                value: 1,
                label: 'Orders',
                textValue: 'Orders',
            },
            {
                id: 'category-2',
                value: 2,
                label: 'Pricing',
                textValue: 'Pricing',
            },
        ])
    })

    it('should display the category label', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="en-US" categoryId={1} />
            </Provider>,
        )
        await screen.findByText('Category')
    })

    it('should show new options if locale changed', async () => {
        const { rerender } = render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="en-US" categoryId={1} />
            </Provider>,
        )

        expect(useCategoriesOptions).toHaveBeenCalledWith({ locale: 'en-US' })
        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {
                id: 'no-category',
                value: null,
                label: '- no category -',
                textValue: '- no category -',
            },
            {
                id: 'category-1',
                value: 1,
                label: 'Commandes',
                textValue: 'Commandes',
            },
            {
                id: 'category-2',
                value: 2,
                label: 'Prix',
                textValue: 'Prix',
            },
        ])

        rerender(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="fr-FR" categoryId={1} />
            </Provider>,
        )

        expect(useCategoriesOptions).toHaveBeenCalledWith({ locale: 'fr-FR' })
    })

    it('should not be searchable when there is only the "no category" option', async () => {
        const user = userEvent.setup()
        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {
                id: 'no-category',
                value: null,
                label: '- no category -',
                textValue: '- no category -',
            },
        ])

        render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="en-US" categoryId={null} />
            </Provider>,
        )

        const input = screen.getByRole('textbox')
        await user.click(input)

        const listbox = screen.getByRole('listbox')
        const searchInput = within(listbox).queryByRole('searchbox')
        expect(searchInput).not.toBeInTheDocument()
    })

    it('should be searchable when there are categories available', async () => {
        const user = userEvent.setup()
        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {
                id: 'no-category',
                value: null,
                label: '- no category -',
                textValue: '- no category -',
            },
            {
                id: 'category-1',
                value: 1,
                label: 'Orders',
                textValue: 'Orders',
            },
            {
                id: 'category-2',
                value: 2,
                label: 'Pricing',
                textValue: 'Pricing',
            },
        ])

        render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="en-US" categoryId={1} />
            </Provider>,
        )

        const input = screen.getByRole('textbox')
        await user.click(input)

        const searchInput = await screen.findByRole('searchbox', {
            name: /search/i,
        })
        expect(searchInput).toBeInTheDocument()
    })

    it('should call onChange when a category is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        ;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
            {
                id: 'no-category',
                value: null,
                label: '- no category -',
                textValue: '- no category -',
            },
            {
                id: 'category-1',
                value: 1,
                label: 'Orders (< Top Level Category >)',
                textValue: 'Orders',
            },
            {
                id: 'category-2',
                value: 2,
                label: 'Pricing (< Top Level Category >)',
                textValue: 'Pricing',
            },
        ])

        render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect
                    locale="en-US"
                    categoryId={1}
                    onChange={onChange}
                />
            </Provider>,
        )

        const input = screen.getByRole('textbox')
        await user.click(input)

        const listbox = screen.getByRole('listbox')
        const pricingOption = within(listbox).getByText('Pricing')
        await user.click(pricingOption)

        expect(onChange).toHaveBeenCalledWith(2)
    })

    it('should call onChange with null when "no category" is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect
                    locale="en-US"
                    categoryId={1}
                    onChange={onChange}
                />
            </Provider>,
        )

        const input = screen.getByRole('textbox')
        await user.click(input)

        const listbox = screen.getByRole('listbox')
        const noCategoryOption = within(listbox).getByText('- no category -')
        await user.click(noCategoryOption)

        expect(onChange).toHaveBeenCalledWith(null)
    })

    it('should not throw error when onChange is not provided', async () => {
        const user = userEvent.setup()

        render(
            <Provider store={mockStore(defaultState)}>
                <ArticleCategorySelect locale="en-US" categoryId={1} />
            </Provider>,
        )

        const input = screen.getByRole('textbox')
        await user.click(input)

        const listbox = screen.getByRole('listbox')
        const pricingOption = within(listbox).getByText('Pricing')

        await expect(user.click(pricingOption)).resolves.not.toThrow()
    })
})
