import {render, screen} from '@testing-library/react'
import React from 'react'
import {TipQualifier} from 'services/supportPerformanceTipService'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'
import * as PerformanceTipHook from 'hooks/reporting/usePerformanceTips'
import {MetricName} from 'services/reporting/constants'

jest.mock('hooks/reporting/usePerformanceTips')

describe('SupportPerformanceTip', () => {
    it('should render tip from PerformanceTipProvider', () => {
        const metric = MetricName.MessagesPerTicket
        const average = '4.9'
        const topTen = '3.1'
        const content = 'some content'

        jest.spyOn(PerformanceTipHook, 'usePerformanceTips').mockReturnValue({
            type: TipQualifier.Success,
            content,
            average,
            topTen,
        })

        render(
            <SupportPerformanceTip
                metric={metric}
                data={{value: 5, prevValue: 4}}
            />
        )

        expect(screen.getByText(average)).toBeInTheDocument()
        expect(screen.getByText(topTen)).toBeInTheDocument()
        expect(screen.getByText(content, {exact: false})).toBeInTheDocument()
    })

    it('should pass null to the provider when value is missing', () => {
        const metric = MetricName.MessagesPerTicket

        const providerMock = jest
            .spyOn(PerformanceTipHook, 'usePerformanceTips')
            .mockReturnValue({
                type: TipQualifier.Success,
                content: 'no content',
                average: '4.9',
                topTen: '3.1',
            })

        render(<SupportPerformanceTip metric={metric} data={undefined} />)

        expect(providerMock).toHaveBeenCalledWith(metric, null)
    })
})
