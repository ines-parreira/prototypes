import { ComponentProps } from 'react'

import { history } from '@repo/routing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { billingState } from 'fixtures/billing'
import { emptyRule, rules } from 'fixtures/rule'
import { user } from 'fixtures/users'
import { ApiListResponseLegacyPagination } from 'models/api/types'
import { fetchRules } from 'models/rule/resources'
import {
    ruleCreated,
    ruleDeleted,
    rulesFetched,
    ruleUpdated,
} from 'state/entities/rules/actions'
import { NotificationStatus } from 'state/notifications/types'
import { Rule } from 'state/rules/types'
import { getEmptyRule } from 'state/rules/utils'
import { RootState } from 'state/types'

import { RuleDetailForm } from '../RuleDetailForm'

jest.mock('state/entities/rules/actions')
jest.mock('models/rule/resources')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('@repo/routing', () => {
    const actualRouting = jest.requireActual('@repo/routing')
    return {
        ...actualRouting,
        history: {
            ...actualRouting.history,
            push: jest.fn(),
        },
    }
})
const mockStore = configureMockStore([thunk])
const defaultStore: Partial<RootState> = {
    billing: fromJS(billingState),
    currentUser: fromJS(user),
    entities: { rules: { '1': rules[0] } } as any,
}

describe('<RuleDetailForm />', () => {
    const mockDate = jest.spyOn(global.Date, 'now').mockImplementation(() => 0)
    const mockUseParams = useParams as jest.Mock
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
        rules: { 1: { ...emptyRule, ...getEmptyRule() } },
        ruleCreated: ruleCreatedMock,
        ruleDeleted: ruleDeletedMock,
        ruleUpdated: ruleUpdatedMock,
        rulesFetched: rulesFetchedMock,
        schemas: fromJS({}),
        notify: notifyMock,
    } as any as ComponentProps<typeof RuleDetailForm>

    const renderComponent = (
        props?: Partial<ComponentProps<typeof RuleDetailForm>>,
    ) =>
        render(
            <MemoryRouter initialEntries={['/app/settings/rules']}>
                <Provider store={mockStore(defaultStore)}>
                    <QueryClientProvider client={appQueryClient}>
                        <RuleDetailForm {...minProps} {...props} />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

    beforeEach(() => {
        mockUseParams.mockReturnValue({ ruleId: '1' })
    })

    afterEach(() => {
        mockDate.mockRestore()
    })

    describe('rendering', () => {
        it('should render an empty form when no rule id', async () => {
            mockUseParams.mockReturnValue({})
            const { container } = renderComponent()

            await waitFor(() => expect(container.firstChild).toMatchSnapshot())
        })

        it('should render a loader when rule id before fetched', () => {
            const { container } = renderComponent()

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render a filled form when rule id after fetched', async () => {
            fetchRulesMock.mockResolvedValue({
                data: [emptyRule],
            } as unknown as ApiListResponseLegacyPagination<Rule[]>)
            const { container } = renderComponent()

            await waitFor(() => {
                expect(rulesFetchedMock.mock.calls).toMatchSnapshot()
                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })

    describe('fetching', () => {
        it('should notify user and send them back to rules on failed fetch', async () => {
            fetchRulesMock.mockRejectedValue('error')
            mockUseParams.mockReturnValue({ ruleId: '404' })
            renderComponent()
            await waitFor(() => {
                expect(notifyMock).toHaveBeenNthCalledWith(1, {
                    message: 'Could not find rule with id: 404',
                    status: NotificationStatus.Error,
                })
            })
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/settings/rules',
            )
        })
    })

    describe('navbar', () => {
        it('should navigate to ticket list on click', () => {
            renderComponent()
            fireEvent.click(screen.getByText('Affected tickets'))
            expect(
                screen.getByText("This rule hasn't fired yet."),
            ).toBeInTheDocument()
        })
    })
})
