import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {ManagedRulesSlugs} from 'state/rules/types'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'
import AutoReplyReturnEditor from '../AutoReplyReturnEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({[FeatureFlagKey.ChatVideoSharingExtra]: true})

describe('<AutoReplyReturnEditor/>', () => {
    const minProps: ComponentProps<typeof AutoReplyReturnEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoReplyReturn,
            block_list: [],
            body_text: 'Hi {{ticket.customer.firstname}}',
            signature_text: '{{current_user.lastname}}',
            return_portal_url:
                'https://exemple.com/?user={{current_user.name}}',
        },
        onChange: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {
            ruleRecipes: {
                [ManagedRulesSlugs.AutoCloseSpam as string]:
                    emptyRuleRecipeFixture,
            },
        },
    } as RootState)

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render component', () => {
        const {container} = render(
            <Provider store={store}>
                <AutoReplyReturnEditor {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it.each([
        [undefined, false],
        ['', false],
        ['exemple.com', false],
        ['http://exemple.com', true],
        ['https://exemple.com', true],
        ['ftp://exemple.com', false],
        ['https://exemple.com/?user_email={{ticket.customer.email}}', true],
    ])('should validate Return portal URL field %s ', (url, valid) => {
        minProps.settings.return_portal_url = url
        const onChangeSpy = jest.fn()
        minProps.onChange = () => onChangeSpy

        render(
            <Provider store={store}>
                <AutoReplyReturnEditor {...minProps} />
            </Provider>
        )

        if (valid) {
            expect(onChangeSpy).toHaveBeenCalledWith(expect.any(Object), false)
            expect(screen.queryByText('Enter a valid URL')).toBeFalsy()
        } else {
            expect(onChangeSpy).toHaveBeenCalledWith(expect.any(Object), true)
            expect(screen.queryByText('Enter a valid URL')).toBeTruthy()
        }
    })
})
