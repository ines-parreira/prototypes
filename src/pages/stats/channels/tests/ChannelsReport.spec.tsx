import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import ChannelsReport, {
    CHANNELS_REPORT_PAGE_TITLE,
} from 'pages/stats/channels/ChannelsReport'
import {RootState, StoreDispatch} from 'state/types'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

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

describe('ChannelsReport', () => {
    it('should render channels report component', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <ChannelsReport />
            </Provider>
        )

        expect(getByText(CHANNELS_REPORT_PAGE_TITLE)).toBeInTheDocument()
    })
})
