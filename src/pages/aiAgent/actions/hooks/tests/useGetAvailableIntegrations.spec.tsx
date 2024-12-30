import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'

import {RootState, StoreDispatch} from 'state/types'

import {SHIPMONK_APPLICATION_ID} from '../../../../automate/workflows/models/variables.types'
import use3plIntegrations from '../use3plIntegrations'

jest.mock('launchdarkly-react-client-sdk')

const mockUseFlags = jest.mocked(useFlags)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('use3plIntegrations', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should get available integrations', () => {
        mockUseFlags.mockReturnValue({[FeatureFlagKey.Actions3plObjects]: true})

        const storeState = {
            integrations: fromJS({
                integrations: [
                    {
                        type: 'http',
                        application_id: SHIPMONK_APPLICATION_ID,
                        id: 1,
                    },
                    {
                        type: 'http',
                        application_id: SHIPMONK_APPLICATION_ID,
                        deleted_datetime: '2021-09-01T00:00:00Z',
                        id: 2,
                    },
                    {
                        type: 'http',
                        application_id: SHIPMONK_APPLICATION_ID,
                        deactivated_datetime: '2021-09-01T00:00:00Z',
                        id: 3,
                    },
                    {
                        type: 'app',
                        application_id: 'different-application-id',
                        id: 4,
                    },
                    {
                        type: 'app',
                        id: 5,
                    },
                ],
            }),
        } as RootState

        const {result} = renderHook(() => use3plIntegrations(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(storeState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual([
            {
                integration_id: 1,
                application_id: SHIPMONK_APPLICATION_ID,
            },
        ])
    })
})
