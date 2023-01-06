import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {ManagedRulesSlugs} from 'state/rules/types'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'

import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'
import AutoReplyFAQEditor from '../AutoReplyFAQEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({[FeatureFlagKey.ChatVideoSharingExtra]: true})

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
        helpCenter: {articles: {}, categories: {}, helpCenters: {}},
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render correctly', () => {
        const store = mockStore({
            entities,
        } as RootState)
        const {container} = render(
            <Provider store={store}>
                <AutoReplyFAQEditor {...minProps} />
            </Provider>
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
                            '1': {id: 1, name: 'help center 1'},
                            '2': {id: 2, name: 'help center 2'},
                        },
                    },
                },
            },
        } as unknown as RootState)
        const {getByText} = render(
            <Provider store={store}>
                <AutoReplyFAQEditor {...minProps} />
            </Provider>
        )
        expect(getByText('help center 1'))
        expect(getByText('help center 2'))
        expect(
            getByText(
                'You have more than 1 help center. Ensure the desired help center is selected below.'
            )
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
                            '1': {
                                id: 1,
                                name: 'help center 1',
                                deactivated_datetime: '2022-01-01',
                            },
                            '2': {id: 2, name: 'help center 2'},
                        },
                    },
                },
            },
        } as unknown as RootState)
        const {getByText} = render(
            <Provider store={store}>
                <AutoReplyFAQEditor {...minProps} />
            </Provider>
        )
        expect(getByText('help center 2'))
        expect(
            getByText(
                'Your previously selected help center was deleted or deactivated. Please select a new one to reactivate this rule.'
            )
        )
        expect(minProps.handleInstallationError).toHaveBeenCalled()
    })
})
