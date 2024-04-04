import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

import ServiceLevelAgreements from 'pages/stats/ServiceLevelAgreements'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
jest.mock('pages/stats/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: () => <div />,
}))

describe('ServiceLevelAgreements', () => {
    it('should render service level agreements', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(getByText('SLAs')).toBeInTheDocument()
    })
})
