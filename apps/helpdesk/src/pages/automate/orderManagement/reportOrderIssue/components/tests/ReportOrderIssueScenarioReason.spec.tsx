import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { ShopifyIntegration } from 'models/integration/types'
import type { RootState, StoreDispatch } from 'state/types'

import { useReportOrderIssueScenarioFormContext } from '../ReportOrderIssueScenarioFormContext'
import ReportOrderIssueScenarioReason from '../ReportOrderIssueScenarioReason'

jest.mock('../ReportOrderIssueScenarioFormContext')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockUseReportOrderIssueScenarioFormContext = assumeMock(
    useReportOrderIssueScenarioFormContext,
)

describe('<ReportOrderIssueScenarioReason />', () => {
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
                <ReportOrderIssueScenarioReason
                    onDelete={jest.fn()}
                    onPreviewChange={jest.fn()}
                    value={{
                        reasonKey: 'reason-key',
                        action: {
                            responseMessageContent: {
                                html: 'response-html',
                                text: 'response-text',
                            },
                            showHelpfulPrompt: true,
                            type: 'automated_response',
                        },
                    }}
                />
            </Provider>,
        )

        expect(screen.getByText('response-html')).toBeInTheDocument()
    })
})
