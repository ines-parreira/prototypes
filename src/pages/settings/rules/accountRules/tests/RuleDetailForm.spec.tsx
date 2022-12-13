import React, {ComponentProps} from 'react'
import {Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import {
    ruleUpdated,
    ruleDeleted,
    ruleCreated,
    rulesFetched,
} from '../../../../../state/entities/rules/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {fetchRules} from '../../../../../models/rule/resources'
import {emptyRule, rules} from '../../../../../fixtures/rule'
import {getEmptyRule} from '../../../../../state/rules/utils'
import {Rule} from '../../../../../state/rules/types'
import {ApiListResponsePagination} from '../../../../../models/api/types'
import history from '../../../../history'
import {billingState} from '../../../../../fixtures/billing'
import {user} from '../../../../../fixtures/users'

import {RootState} from '../../../../../state/types'

import {RuleDetailForm} from '../RuleDetailForm'

jest.mock('../../../../../state/entities/rules/actions')
jest.mock('../../../../../models/rule/resources')

const mockStore = configureMockStore([thunk])
const defaultStore: Partial<RootState> = {
    billing: fromJS(billingState),
    currentUser: fromJS(user),
    entities: {rules: {'1': rules[0]}} as any,
}

describe('<RuleDetailForm />', () => {
    const mockDate = jest.spyOn(global.Date, 'now').mockImplementation(() => 0)

    const ruleUpdatedMock = ruleUpdated as jest.MockedFunction<
        typeof ruleUpdated
    >
    const ruleDeletedMock = ruleDeleted as jest.MockedFunction<
        typeof ruleDeleted
    >
    const ruleCreatedMock = ruleCreated as jest.MockedFunction<
        typeof ruleCreated
    >
    const rulesFetchedMock = rulesFetched as jest.MockedFunction<
        typeof rulesFetched
    >
    const fetchRulesMock = fetchRules as jest.MockedFunction<typeof fetchRules>

    const notifyMock = jest.fn()

    const minProps = {
        rules: {1: {...emptyRule, ...getEmptyRule()}},
        ruleCreated: ruleCreatedMock,
        ruleDeleted: ruleDeletedMock,
        ruleUpdated: ruleUpdatedMock,
        rulesFetched: rulesFetchedMock,
        schemas: fromJS({}),
        notify: notifyMock,
        match: {params: {}},
    } as any as ComponentProps<typeof RuleDetailForm>

    const matchProp = {
        params: {
            ruleId: '1',
        },
        isExact: true,
        path: 'foo/',
        url: 'foo/',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        mockDate.mockRestore()
    })

    describe('rendering', () => {
        it('should render an empty form when no rule id', async () => {
            const {container} = render(
                <Router history={history}>
                    <Provider store={mockStore(defaultStore)}>
                        <RuleDetailForm {...minProps} />
                    </Provider>
                </Router>
            )
            await waitFor(() => expect(container.firstChild).toMatchSnapshot())
        })

        it('should render a loader when rule id before fetched', () => {
            const {container} = render(
                <Router history={history}>
                    <Provider store={mockStore(defaultStore)}>
                        <RuleDetailForm {...minProps} match={matchProp} />
                    </Provider>
                </Router>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render a filled form when rule id after fetched', async () => {
            fetchRulesMock.mockResolvedValue({
                data: [emptyRule],
            } as unknown as ApiListResponsePagination<Rule[]>)
            const {container} = render(
                <Router history={history}>
                    <Provider store={mockStore(defaultStore)}>
                        <RuleDetailForm {...minProps} match={matchProp} />
                    </Provider>
                </Router>
            )

            await waitFor(() => {
                expect(rulesFetchedMock.mock.calls).toMatchSnapshot()
                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })

    describe('fetching', () => {
        it('should notify user and send them back to rules on failed fetch', async () => {
            fetchRulesMock.mockRejectedValue('error')
            render(
                <Router history={history}>
                    <Provider store={mockStore(defaultStore)}>
                        <RuleDetailForm
                            {...minProps}
                            match={{...matchProp, params: {ruleId: '404'}}}
                        />
                    </Provider>
                </Router>
            )
            await waitFor(() => {
                expect(notifyMock).toHaveBeenNthCalledWith(1, {
                    message: 'Could not find rule with id: 404',
                    status: NotificationStatus.Error,
                })
            })
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/settings/rules'
            )
        })
    })

    describe('navbar', () => {
        it('should navigate to ticket list on click', () => {
            const {getByText} = render(
                <Router history={history}>
                    <Provider store={mockStore(defaultStore)}>
                        <RuleDetailForm {...minProps} match={matchProp} />
                    </Provider>
                </Router>
            )
            fireEvent.click(getByText('Affected tickets'))
            getByText("This rule hasn't fired yet.")
        })
    })
})
