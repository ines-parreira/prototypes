import {render, screen} from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {assumeMock} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {ShopifyIntegration} from 'models/integration/types'
import ReportOrderIssueScenarioReason from '../ReportOrderIssueScenarioReason'
import {useReportOrderIssueScenarioFormContext} from '../ReportOrderIssueScenarioFormContext'

jest.mock('../ReportOrderIssueScenarioFormContext')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockUseReportOrderIssueScenarioFormContext = assumeMock(
    useReportOrderIssueScenarioFormContext
)

describe('<ReportOrderIssueScenarioReason />', () => {
    it('should render component', () => {
        mockUseReportOrderIssueScenarioFormContext.mockReturnValue({
            errors: {},
            hasError: false,
            isUpdatePending: false,
            setError: jest.fn(),
            storeIntegration: {id: 1} as ShopifyIntegration,
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
            </Provider>
        )

        expect(screen.getByText('response-html')).toBeInTheDocument()
    })
})
