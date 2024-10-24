import {render} from '@testing-library/react'
import React from 'react'

import {useDrillDownData} from 'hooks/reporting/useDrillDownData'
import {formatVoiceDrillDownRowData} from 'pages/stats/DrillDownFormatters'
import {VoiceMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

import {getVoiceDrillDownColumns} from './utils'
import VoiceCallDrillDownTableContent from './VoiceCallDrillDownTableContent'
import VoiceCallTableContent from './VoiceCallTableContent'

jest.mock('pages/stats/voice/components/VoiceCallTable/VoiceCallTableContent')
jest.mock('hooks/reporting/useDrillDownData')

const useDrillDownDataMock = assumeMock(useDrillDownData)
const VoiceCallTableContentMock = assumeMock(VoiceCallTableContent)

describe('VoiceCallDrillDownTableContent', () => {
    const renderComponent = () => {
        return render(
            <VoiceCallDrillDownTableContent
                metricData={{
                    metricName: VoiceMetric.AverageTalkTime,
                }}
            />
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
            {
                metricName: VoiceMetric.AverageTalkTime,
            },
            formatVoiceDrillDownRowData
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
            {}
        )
    })
})
