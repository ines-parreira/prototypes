import React, {ComponentProps} from 'react'
import {render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import {
    ruleUpdated,
    ruleDeleted,
    ruleCreated,
    rulesFetched,
} from '../../../../state/entities/rules/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {fetchRules} from '../../../../models/rule/resources'
import {emptyRule} from '../../../../fixtures/rule'
import {getEmptyRule} from '../../../../state/rules/utils'
import {Rule} from '../../../../state/rules/types'
import {ApiListResponsePagination} from '../../../../models/api/types'
import history from '../../../history'

import {RulesSettingsFormContainer} from '../RulesSettingsForm'

jest.mock('../../../../state/entities/rules/actions')
jest.mock('../../../../models/rule/resources')

describe('<RuleSettingsForm />', () => {
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

    const minProps = ({
        rules: {1: {...emptyRule, ...getEmptyRule()}},
        ruleCreated: ruleCreatedMock,
        ruleDeleted: ruleDeletedMock,
        ruleUpdated: ruleUpdatedMock,
        rulesFetched: rulesFetchedMock,
        schemas: fromJS({}),
        notify: notifyMock,
        match: {params: {}},
    } as any) as ComponentProps<typeof RulesSettingsFormContainer>

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
        it('should render an empty form when no rule id', () => {
            const {container} = render(
                <RulesSettingsFormContainer {...minProps} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a loader when rule id before fetched', () => {
            const {container} = render(
                <RulesSettingsFormContainer {...minProps} match={matchProp} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render a filled form when rule id after fetched', async () => {
            fetchRulesMock.mockResolvedValue(({
                data: [emptyRule],
            } as unknown) as ApiListResponsePagination<Rule[]>)
            const {container} = render(
                <RulesSettingsFormContainer {...minProps} match={matchProp} />
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
                <RulesSettingsFormContainer {...minProps} match={matchProp} />
            )
            await waitFor(() => {
                expect(notifyMock).toHaveBeenNthCalledWith(1, {
                    message: 'Failed to fetch rules',
                    status: NotificationStatus.Error,
                })
            })
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/settings/rules'
            )
        })
    })
})
