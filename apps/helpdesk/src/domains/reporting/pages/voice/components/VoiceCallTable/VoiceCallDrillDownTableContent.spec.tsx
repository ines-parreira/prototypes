import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useDrillDownDataV2 } from 'domains/reporting/hooks/useDrillDownData'
import { formatVoiceDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { getVoiceDrillDownColumns } from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import VoiceCallDrillDownTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'

jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent',
)
jest.mock('domains/reporting/hooks/useDrillDownData')

const useDrillDownDataMock = assumeMock(useDrillDownDataV2)
const VoiceCallTableContentMock = assumeMock(VoiceCallTableContent)

describe('VoiceCallDrillDownTableContent', () => {
    const renderComponent = () => {
        return render(
            <VoiceCallDrillDownTableContent
                metricData={{
                    metricName: VoiceMetric.AverageTalkTime,
                }}
            />,
        )
    }

    beforeEach(() => {
        useDrillDownDataMock.mockReturnValue({
            data: [],
            isFetching: false,
        } as any)
        VoiceCallTableContentMock.mockReturnValue((() => <div />) as any)
    })

    it('should render VoiceCallTableContent with drill down data', () => {
        const data = ['test-data']
        useDrillDownDataMock.mockReturnValue({
            data,
            isFetching: true,
        } as any)

        renderComponent()

        expect(useDrillDownDataMock).toHaveBeenCalledWith(
            expect.any(Function),
            undefined,
            {
                metricName: VoiceMetric.AverageTalkTime,
            },
            formatVoiceDrillDownRowData,
        )
        expect(VoiceCallTableContentMock).toHaveBeenCalledWith(
            {
                data,
                isFetching: true,
                onRowClick: expect.any(Function),
                isRecordingDownloadable: false,
                columns: getVoiceDrillDownColumns(VoiceMetric.AverageTalkTime),
                useMeasuredWidth: false,
            },
            {},
        )
    })
})
