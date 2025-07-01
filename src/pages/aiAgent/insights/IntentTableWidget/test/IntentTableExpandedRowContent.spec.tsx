import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntentTableExpandedRowContent } from '../IntentTableExpandedRowContent'
import { Intent, IntentTableColumn } from '../types'

jest.mock('../hooks/useGetCustomTicketsFieldsDefinitionData', () => ({
    useGetCustomTicketsFieldsDefinitionData: jest.fn().mockReturnValue({
        intentCustomFieldId: 123,
        outcomeCustomFieldId: 456,
        sentimentCustomFieldId: null,
    }),
}))

jest.mock('hooks/reporting/automate/useAIAgentUserId', () => ({
    useAIAgentUserId: jest.fn().mockReturnValue('789'),
}))

jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations', () => ({
    useGetTicketChannelsStoreIntegrations: jest
        .fn()
        .mockReturnValue(['int-1', 'int-2']),
}))

jest.mock('../IntentTableCells', () => ({
    IntentNameCellContent: () => <div data-testid="name-cell">Name Cell</div>,
    IntentSuccessRateUpliftOpportunitiesCellContent: () => (
        <div data-testid="uplift-cell">Uplift Cell</div>
    ),
    IntentAvgCsatCellContent: () => (
        <div data-testid="csat-cell">CSAT Cell</div>
    ),
    IntentDefaultCellContent: () => (
        <div data-testid="default-cell">Default Cell</div>
    ),
}))

jest.mock(
    'pages/stats/common/components/Table/TableWithNestedRowsCell',
    () => ({
        TableWithNestedRowsCell: ({
            children,
            onClick,
        }: {
            children: React.ReactNode
            onClick: () => void
        }) => (
            <div data-testid="nested-cell" onClick={onClick}>
                {children}
            </div>
        ),
    }),
)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const mockIntent: Intent = {
    id: 'intent-1',
    [IntentTableColumn.IntentName]: 'Test Intent',
    [IntentTableColumn.SuccessRateUpliftOpportunity]: 0.25,
    [IntentTableColumn.Tickets]: 100,
    [IntentTableColumn.SuccessRate]: 0.75,
    [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
}

const mockAllIntents: Intent[] = [
    mockIntent,
    {
        id: 'intent-2',
        [IntentTableColumn.IntentName]: 'Another Intent',
        [IntentTableColumn.SuccessRateUpliftOpportunity]: 0.15,
        [IntentTableColumn.Tickets]: 50,
        [IntentTableColumn.SuccessRate]: 0.85,
        [IntentTableColumn.AvgCustomerSatisfaction]: 4.2,
    },
]

describe('IntentTableExpandedRowContent', () => {
    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <MemoryRouter
                    initialEntries={['/shops/test-shop/ai-agent/insights']}
                >
                    <Route path="/shops/:shopName/ai-agent/insights">
                        <IntentTableExpandedRowContent
                            intent={mockIntent}
                            allIntents={mockAllIntents}
                            intentLevel={2}
                            isTableScrolled={false}
                            hasChildren={true}
                            {...props}
                        />
                    </Route>
                </MemoryRouter>
            </Provider>,
        )
    }

    it('renders the intent name in the nested cell', () => {
        renderComponent()
        const nestedCell = screen.getByTestId('nested-cell')
        expect(nestedCell).toHaveTextContent('Test Intent')
    })

    it('calls onClick when the nested cell is clicked', () => {
        const onClickMock = jest.fn()
        renderComponent({ onClick: onClickMock })

        const nestedCell = screen.getByTestId('nested-cell')
        nestedCell.click()

        expect(onClickMock).toHaveBeenCalled()
    })
})
