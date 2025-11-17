import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationsState } from 'fixtures/integrations'
import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import { ManagedRulesSlugs } from 'state/rules/types'
import type { RootState, StoreDispatch } from 'state/types'

import AutoReplyFAQEditor from '../AutoReplyFAQEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('<AutoReplyFAQEditor/>', () => {
    const minProps: ComponentProps<typeof AutoReplyFAQEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoReplyWismo,
            block_list: [],
            help_center_id: 1,
        },
        onChange: jest.fn(),
        handleInstallationError: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const entities = {
        ruleRecipes: {
            [ManagedRulesSlugs.AutoReplyFAQ as string]: emptyRuleRecipeFixture,
        },
        helpCenter: { articles: {}, categories: {}, helpCenters: {} },
    }

    it('should render correctly', () => {
        const store = mockStore({
            entities,
            integrations: fromJS(integrationsState),
        } as RootState)
        const { container } = render(
            <Provider store={store}>
                <AutoReplyFAQEditor {...minProps} />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a <SelectField/> and an alert if there are multiple help centers', () => {
        const store = mockStore({
            entities: {
                ...entities,
                helpCenter: {
                    articles: {},
                    categories: {},
                    helpCenters: {
                        helpCentersById: {
                            '1': { id: 1, name: 'help center 1', type: 'faq' },
                            '2': { id: 2, name: 'help center 2', type: 'faq' },
                        },
                    },
                },
            },
            integrations: fromJS(integrationsState),
        } as unknown as RootState)
        const { getByText } = render(
            <Provider store={store}>
                <AutoReplyFAQEditor {...minProps} />
            </Provider>,
        )
        expect(getByText('help center 1'))
        expect(getByText('help center 2'))
        expect(
            getByText(
                'You have more than 1 help center. Ensure the desired help center is selected below.',
            ),
        )
    })
    it('should render an <Alert/> if the helpCenter is no longer available', () => {
        const store = mockStore({
            entities: {
                ...entities,
                helpCenter: {
                    articles: {},
                    categories: {},
                    helpCenters: {
                        helpCentersById: {
                            '2': { id: 2, name: 'help center 2', type: 'faq' },
                        },
                    },
                },
            },
            integrations: fromJS(integrationsState),
        } as unknown as RootState)
        const { getByText } = render(
            <Provider store={store}>
                <AutoReplyFAQEditor {...minProps} />
            </Provider>,
        )
        expect(getByText('help center 2'))
        expect(
            getByText(
                'Your previously selected help center was deleted. Please select a new one to reactivate this rule.',
            ),
        )
        expect(minProps.handleInstallationError).toHaveBeenCalled()
    })
})
