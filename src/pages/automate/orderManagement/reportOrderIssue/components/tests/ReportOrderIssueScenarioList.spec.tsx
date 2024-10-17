import {render, screen} from '@testing-library/react'
import React from 'react'
import * as ReactRouterDom from 'react-router-dom'
import {SelfServiceReportIssueCase} from 'models/selfServiceConfiguration/types'
import ReportOrderIssueScenarioList from '../ReportOrderIssueScenarioList'

const mockHistoryPush = jest.fn()
const mockHistoryGoBack = jest.fn()

jest.mock(
    'react-router',
    () =>
        ({
            ...jest.requireActual('react-router'),
            useLocation: jest.fn(),
            useHistory: () => ({
                block: jest.fn(),
                push: mockHistoryPush,
                goBack: mockHistoryGoBack,
            }),
        }) as Record<string, any>
)
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

jest.mock('hooks/useId', () => jest.fn(() => 'mocked'))
const useLocationSpy = jest.spyOn(ReactRouterDom, 'useLocation')
describe('<ReportOrderIssueScenarioList />', () => {
    const item = {
        title: 'Refunded',
        description: 'If order has being fully or partially refunded.',
        conditions: {
            and: [
                {
                    in: [
                        {
                            var: 'financial_status',
                        },
                        ['refunded', 'partially_refunded'],
                    ],
                },
            ],
        },
        newReasons: [
            {
                action: {
                    type: 'automated_response',
                    showHelpfulPrompt: true,
                    responseMessageContent: {
                        html: '<div>Please note a refund was issued back to the original method of payment. Please allow up to 5 business days for the refund to be reflected on your account.</div><div>If it&#x27;s been more than 5 business days, let us know you need more help.</div>',
                        text: "Please note a refund was issued back to the original method of payment. Please allow up to 5 business days for the refund to be reflected on your account. If it's been more than 5 business days, let us know you need more help.",
                    },
                },
                reasonKey: 'reasonDidNotReceiveRefund',
            },
            {
                action: {
                    type: 'automated_response',
                    showHelpfulPrompt: false,
                    responseMessageContent: {
                        html: null,
                        text: null,
                    },
                },
                reasonKey: 'reasonReorderItems',
            },
        ],
    }
    it('should render component', () => {
        useLocationSpy.mockReturnValue({key: 'abc'} as any)

        render(
            <ReportOrderIssueScenarioList
                items={[item as SelfServiceReportIssueCase]}
                onHasHoveredItemChange={jest.fn()}
                onReorder={jest.fn()}
            />
        )
        expect(screen.getByText(item.description)).toBeInTheDocument()
    })
})
