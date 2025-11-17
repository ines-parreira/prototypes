import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { ShopifyIntegration } from 'models/integration/types'
import type { RootState, StoreDispatch } from 'state/types'

import { useReportOrderIssueScenarioFormContext } from '../ReportOrderIssueScenarioFormContext'
import ReportOrderIssueScenarioReasonAction from '../ReportOrderIssueScenarioReasonAction'

jest.mock('../ReportOrderIssueScenarioFormContext')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockUseReportOrderIssueScenarioFormContext = assumeMock(
    useReportOrderIssueScenarioFormContext,
)

describe('<ReportOrderIssueScenarioReasonAction />', () => {
    it('should render component', () => {
        mockUseReportOrderIssueScenarioFormContext.mockReturnValue({
            errors: {},
            hasError: false,
            isUpdatePending: false,
            setError: jest.fn(),
            storeIntegration: { id: 1 } as ShopifyIntegration,
        })
        render(
            <Provider store={mockStore({})}>
                <ReportOrderIssueScenarioReasonAction
                    onChange={jest.fn()}
                    value={{
                        showHelpfulPrompt: true,
                        type: 'automated_response',
                        responseMessageContent: {
                            html: 'html',
                            text: 'text',
                        },
                    }}
                />
            </Provider>,
        )

        expect(
            screen.getByText('Ask customers if your response was helpful'),
        ).toBeInTheDocument()
    })
})
