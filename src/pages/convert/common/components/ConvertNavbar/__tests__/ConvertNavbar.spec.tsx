import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {RootState} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {user} from 'fixtures/users'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {ThemeProvider} from 'theme'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertNavbar from '../ConvertNavbar'

jest.mock('react-router')
jest.mock('pages/common/hooks/useIsConvertSubscriber')

const isConvertSubscriberMock = useIsConvertSubscriber as jest.Mock

const mockStore = configureMockStore()

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
            },
        ])
    )

    describe('render()', () => {
        it('should render empty convert navbar when no integrations', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <ConvertNavbar />
                        </ThemeProvider>
                    </DndProvider>
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
                        <ThemeProvider>
                            <ConvertNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>
            )

            expect(getAllByText('forum').length).toBe(2)

            expect(getAllByText('Performance').length).toBe(2)
            expect(getAllByText('Campaigns').length).toBe(2)
            expect(getAllByText('Click tracking').length).toBe(2)
            expect(getAllByText('Installation').length).toBe(2)

            expect(getByText('convertgorgiastestchat')).toBeInTheDocument()

            // We expect 2 paywall icons per each integration
            expect(getAllByText('arrow_circle_up').length).toBe(4)
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
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <ConvertNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>
            )

            expect(getAllByText('forum').length).toBe(2)

            expect(getAllByText('Performance').length).toBe(2)
            expect(getAllByText('Campaigns').length).toBe(2)
            expect(getAllByText('Click tracking').length).toBe(2)
            expect(getAllByText('Installation').length).toBe(2)

            expect(getByText('convertgorgiastestchat')).toBeInTheDocument()

            expect(queryByText('arrow_circle_up')).not.toBeInTheDocument()
        })
    })
})
