import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {QueryClientProvider} from '@tanstack/react-query'
import {RootState} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {user} from 'fixtures/users'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {ThemeProvider} from 'theme'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import ConvertNavbar from '../ConvertNavbar'

jest.mock('react-router')
jest.mock('pages/common/hooks/useIsConvertSubscriber')

jest.mock('pages/convert/channelConnections/hooks/useGetOnboardingStatusMap')
const useGetOnboardingStatusMapSpy = assumeMock(useGetOnboardingStatusMap)

const isConvertSubscriberMock = useIsConvertSubscriber as jest.Mock

const mockStore = configureMockStore()

const queryClient = mockQueryClient()

describe('<ConvertNavbar />', () => {
    const defaultState: Partial<RootState> = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        integrations: fromJS({integrations: []}),
    }
    const integrations = (fromJS(integrationsState) as Map<any, any>).mergeIn(
        ['integrations'],
        fromJS([
            {
                id: 99,
                name: 'convertgorgiastestchat',
                deleted_datetime: null,
                deactivated_datetime: null,
                type: 'gorgias_chat',
                meta: {
                    app_id: '101',
                },
            },
        ])
    )

    useGetOnboardingStatusMapSpy.mockReturnValue({'101': true})

    describe('render()', () => {
        it('should render empty convert navbar when no integrations', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={HTML5Backend}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
            )

            expect(queryByText('forum')).not.toBeInTheDocument()
            expect(queryByText('Performance')).not.toBeInTheDocument()
            expect(queryByText('Campaigns')).not.toBeInTheDocument()
            expect(queryByText('Click tracking')).not.toBeInTheDocument()
            expect(queryByText('Installation')).not.toBeInTheDocument()
        })

        it('should render convert navbar with integrations', () => {
            const {getAllByText, getByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: integrations,
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <QueryClientProvider client={queryClient}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </QueryClientProvider>
                    </DndProvider>
                </Provider>
            )

            expect(getAllByText('forum').length).toBe(2)

            expect(getAllByText('Performance').length).toBe(1)
            expect(getAllByText('Campaigns').length).toBe(1)
            expect(getAllByText('Click tracking').length).toBe(1)
            expect(getAllByText('Installation').length).toBe(1)
            expect(getAllByText('Set up').length).toBe(1)

            expect(getByText('convertgorgiastestchat')).toBeInTheDocument()

            // We expect 2 paywall icons per each integration
            expect(getAllByText('arrow_circle_up').length).toBe(2)
        })

        it('should render convert navbar with integrations without paywalls', () => {
            isConvertSubscriberMock.mockReturnValue(true)

            const {getAllByText, getByText, queryByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: integrations,
                    })}
                >
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={HTML5Backend}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
            )

            expect(getAllByText('forum').length).toBe(2)

            expect(getAllByText('Performance').length).toBe(1)
            expect(getAllByText('Campaigns').length).toBe(1)
            expect(getAllByText('Click tracking').length).toBe(1)
            expect(getAllByText('Installation').length).toBe(1)
            expect(getAllByText('Set up').length).toBe(1)

            expect(getByText('convertgorgiastestchat')).toBeInTheDocument()

            expect(queryByText('arrow_circle_up')).not.toBeInTheDocument()
        })
    })
})
