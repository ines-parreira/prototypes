import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import LD from 'launchdarkly-react-client-sdk'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {selectContext, fetchWidgets} from 'state/widgets/actions'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {StoreState} from 'state/types'
import {changeActiveTab} from 'state/ui/ticketAIAgentFeedback'
import {FeatureFlagKey} from 'config/featureFlags'
import {getAIAgentMessages} from 'state/ticket/selectors'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {TicketInfobarContainer} from '../TicketInfobarContainer'
import {Infobar} from '../../../common/components/infobar/Infobar/Infobar'

jest.mock('state/widgets/actions')

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock(
    'state/ticket/selectors',
    () =>
        ({
            ...jest.requireActual('state/ticket/selectors'),
            getAIAgentMessages: jest.fn(),
        } as Record<string, unknown>)
)
jest.mock(
    '../../../common/components/infobar/Infobar/Infobar',
    () =>
        ({
            sources,
            isRouteEditingWidgets,
            identifier,
            customer,
            widgets,
            context,
        }: ComponentProps<typeof Infobar>) =>
            (
                <div>
                    <div>Infobar</div>
                    <div>sources: {JSON.stringify(sources)}</div>
                    <div>isRouteEditingWidgets: {isRouteEditingWidgets}</div>
                    <div>identifier: {identifier}</div>
                    <div>customer: {customer}</div>
                    <div>widgets: {JSON.stringify(widgets)}</div>
                    <div>context: {context}</div>
                </div>
            )
)

const mockedGetAIAgentMessages = assumeMock(getAIAgentMessages)
const mockedSelectContext = assumeMock(selectContext)
const mockedFetchWidgets = assumeMock(fetchWidgets)
const mockedChangeActiveTab = assumeMock(changeActiveTab)
const mockStore = configureMockStore([thunk])
const state: Partial<StoreState> = {
    ui: {
        ticketAIAgentFeedback: {
            activeTab: TicketAIAgentFeedbackTab.CustomerInformation,
        },
    } as any,
}
const store = mockStore(state)
store.dispatch = jest.fn()

describe('<TicketInfobarContainer />', () => {
    const minProps = {
        isEditingWidgets: false,
        sources: fromJS({
            ticket: fromJS({
                customer: fromJS({}),
            }),
            customer: fromJS({}),
        }),
        widgets: fromJS({}),
    } as unknown as ComponentProps<typeof TicketInfobarContainer>

    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.FeedbackToAIAgentInTicketViews]: true,
        })
        mockedGetAIAgentMessages.mockReturnValue([
            {
                id: '1',
            } as any,
        ])
    })

    it('should render infobar for active customer', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(mockedSelectContext).toHaveBeenCalledWith()
        expect(mockedFetchWidgets).toHaveBeenCalled()
        expect(container.firstChild).toHaveTextContent('Customer Information')
        expect(container.firstChild).toHaveTextContent('sources: {')
    })

    it('should call changeActive tab when AI Agent tab is clicked', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        const aiAgentTab = screen.getByText('AI Agent')
        userEvent.click(aiAgentTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith(
            TicketAIAgentFeedbackTab.AIAgent
        )

        const customerTab = screen.getByText('Customer Information')
        userEvent.click(customerTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith(
            TicketAIAgentFeedbackTab.CustomerInformation
        )
    })

    it('should not render secondary navbar if there are no AI messages', () => {
        mockedGetAIAgentMessages.mockReturnValue([])

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(screen.queryByText('Customer Information')).toBeNull()
    })
})
