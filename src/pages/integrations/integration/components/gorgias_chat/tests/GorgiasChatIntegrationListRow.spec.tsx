import React, {ReactNode} from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {fromJS, Map, List} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'
import {IntegrationType} from 'models/integration/constants'
import {GorgiasChatStatusEnum} from 'models/integration/types'
import GorgiasChatIntegrationListRow, {
    GorgiasChatIntegrationListRowProps,
    GorgiasChatIntegrationStatusFeedbackMapping,
} from '../GorgiasChatIntegrationListRow'
import * as hookGorgiasChatIntegrationStatusData from '../../../hooks/useGorgiasChatIntegrationStatusData'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const TestWrapper = ({children}: {children: ReactNode}) => (
    <table>
        <tbody>{children}</tbody>
    </table>
)

describe('<GorgiasChatIntegrationListRow />', () => {
    const defaultChat = {
        id: 1,
        name: 'my chat enabled',
        type: IntegrationType.GorgiasChat,
        meta: {
            self_service: {
                enabled: false,
            },
            shop_name: 'my associated Shopify store',
            shop_type: IntegrationType.Shopify,
        },
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456',
        },
    }
    const chat = fromJS(defaultChat) as Map<any, any>
    const defaultProps: GorgiasChatIntegrationListRowProps = {
        chat,
        isLoadingIntegrations: false,
        integrations: fromJS([
            defaultChat,
            {
                id: 3,
                name: 'my associated Shopify store',
                type: IntegrationType.Shopify,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
                deactivated_datetime: new Date('2020-12-17'),
            },
        ]) as List<Map<any, any>>,
    }
    const defaultState = {} as RootState

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render loading feedback if status is being fetched', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: true,
            isChatStatusError: false,
        }))

        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow {...defaultProps} />
                </TestWrapper>
            </Provider>
        )

        expect(getByText(/Loading/)).toBeDefined()
    })

    it('should render unavailable feedback if status fetching resulted in error', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow {...defaultProps} />
                </TestWrapper>
            </Provider>
        )

        expect(getByText(/Status unavailable/)).toBeDefined()
    })

    it.each(Object.entries(GorgiasChatIntegrationStatusFeedbackMapping))(
        'for chat status %s should render %s feedback',
        (status, expected) => {
            jest.spyOn(
                hookGorgiasChatIntegrationStatusData,
                'useGorgiasChatIntegrationStatusData'
            ).mockImplementation(() => ({
                chatStatus: status as GorgiasChatStatusEnum,
                isChatStatusLoading: false,
                isChatStatusError: false,
            }))

            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <TestWrapper>
                        <GorgiasChatIntegrationListRow {...defaultProps} />
                    </TestWrapper>
                </Provider>
            )

            expect(getByText(expected)).toBeDefined()
        }
    )
})
