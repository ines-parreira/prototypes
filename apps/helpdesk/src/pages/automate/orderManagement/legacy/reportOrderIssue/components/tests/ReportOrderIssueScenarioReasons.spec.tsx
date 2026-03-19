import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { ShopifyIntegration } from 'models/integration/types'
import type { RootState, StoreDispatch } from 'state/types'

import { useReportOrderIssueScenarioFormContext } from '../ReportOrderIssueScenarioFormContext'
import ReportOrderIssueScenarioReasons from '../ReportOrderIssueScenarioReasons'

jest.mock('../ReportOrderIssueScenarioFormContext')
jest.mock('pages/common/hooks/useReorderDnD', () => {
    return {
        useReorderDnD: jest.fn().mockResolvedValue({
            dragRef: '',
            dropRef: '',
            handlerId: 0,
            isDragging: false,
        }),
        Callbacks: {
            onHover: jest.fn(),
            onDrop: jest.fn(),
        },
        DragItemRequired: {},
    }
})

const mockUseReportOrderIssueScenarioFormContext = assumeMock(
    useReportOrderIssueScenarioFormContext,
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<ReportOrderIssueScenarioReasons />', () => {
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
                <ReportOrderIssueScenarioReasons
                    expandedItem="item"
                    onChange={jest.fn()}
                    onExpandedItemChange={jest.fn()}
                    onHoveredItemChange={jest.fn()}
                    onPreviewChange={jest.fn()}
                    items={[
                        {
                            reasonKey: 'reason',
                            action: {
                                responseMessageContent: {
                                    html: 'response html content',
                                    text: 'response text content',
                                },
                                showHelpfulPrompt: true,
                                type: 'automated_response',
                            },
                        },
                    ]}
                />
            </Provider>,
        )

        expect(screen.getByText('response html content')).toBeInTheDocument()
    })
})
