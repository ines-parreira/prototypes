import {render, screen} from '@testing-library/react'
import React from 'react'
import {MetricName, TipQualifier} from 'services/performanceTipService'
import {PerformanceTip} from 'pages/stats/PerformanceTip'
import * as PerformanceTipHook from 'hooks/reporting/usePerformanceTips'

jest.mock('hooks/reporting/usePerformanceTips')

describe('PerformanceTip', () => {
    it('should render tip from PerformanceTipProvider', () => {
        const metric = MetricName.MessagesPerTicket
        const title = 'some title'
        const content = 'some content'
        const hint = 'some hint'
        jest.spyOn(PerformanceTipHook, 'usePerformanceTips').mockReturnValue({
            type: TipQualifier.Success,
            title,
            content,
            hint,
        })

        render(
            <PerformanceTip metric={metric} data={{value: 5, prevValue: 4}} />
        )

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(content, {exact: false})).toBeInTheDocument()
    })

    it('should pass null to the provider when value is missing', () => {
        const metric = MetricName.MessagesPerTicket

        const providerMock = jest
            .spyOn(PerformanceTipHook, 'usePerformanceTips')
            .mockReturnValue({
                type: TipQualifier.Success,
                title: 'some title',
                content: 'no content',
                hint: undefined,
            })

        render(<PerformanceTip metric={metric} data={undefined} />)

        expect(providerMock).toHaveBeenCalledWith(metric, null)
    })
})
