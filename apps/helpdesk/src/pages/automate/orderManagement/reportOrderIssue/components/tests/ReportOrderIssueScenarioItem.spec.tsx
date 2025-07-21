import React from 'react'

import { render } from '@testing-library/react'
import * as ReactRouterDom from 'react-router-dom'

import { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'

import ReportOrderIssueScenarioItem from '../ReportOrderIssueScenarioItem'

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
        }) as Record<string, any>,
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
describe('ReportOrderIssueScenarioItem component', () => {
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
    it('should render warning if all the issue type are configured', () => {
        useLocationSpy.mockReturnValue({ key: 'abc' } as any)

        const { getByLabelText } = render(
            <table>
                <tbody>
                    <ReportOrderIssueScenarioItem
                        id={'propsData.id'}
                        item={item as SelfServiceReportIssueCase}
                        position={1}
                        onMove={() => null}
                        onDrop={() => null}
                        onCancel={() => null}
                        onMouseEnter={() => null}
                        onMouseLeave={() => null}
                        isDraggable
                    />
                </tbody>
            </table>,
        )

        expect(getByLabelText(/Icon for response not configured/i))
    })
    it('should not render warning if all the issue type are configured', () => {
        useLocationSpy.mockReturnValue({ key: 'abc' } as any)
        item.newReasons[1].action.responseMessageContent = {
            html: 'hello',
            text: 'wold',
        }
        const { queryByText } = render(
            <table>
                <tbody>
                    <ReportOrderIssueScenarioItem
                        id={'propsData.id'}
                        item={item as SelfServiceReportIssueCase}
                        position={1}
                        onMove={() => null}
                        onDrop={() => null}
                        onCancel={() => null}
                        onMouseEnter={() => null}
                        onMouseLeave={() => null}
                        isDraggable
                    />
                </tbody>
            </table>,
        )
        expect(
            queryByText(/Icon for response not configured/i),
        ).not.toBeInTheDocument()
    })
})
