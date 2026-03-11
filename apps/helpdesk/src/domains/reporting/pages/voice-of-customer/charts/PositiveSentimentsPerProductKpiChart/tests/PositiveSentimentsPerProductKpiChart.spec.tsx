import { assumeMock } from '@repo/testing'

import { PositiveSentimentsPerProductKpi } from 'domains/reporting/pages/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi'
import { PositiveSentimentsPerProductKpiChart } from 'domains/reporting/pages/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpiChart'
import {
    initialState,
    sidePanelSlice,
} from 'domains/reporting/state/ui/stats/sidePanelSlice'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi',
)
const PositiveSentimentsPerProductKpiMock = assumeMock(
    PositiveSentimentsPerProductKpi,
)

describe('PositiveSentimentsPerProductKpiChart', () => {
    const productId = 'productId'
    const product = {
        id: productId,
        name: 'some name',
        thumbnail_url: 'someThumbnailUrl',
    }
    const sentimentCustomFieldId = 123
    const defaultState = {
        ui: {
            stats: {
                [sidePanelSlice.name]: { ...initialState, product },
            },
        },
    } as RootState

    beforeEach(() => {
        PositiveSentimentsPerProductKpiMock.mockImplementation(() => <div />)
    })

    it('should not render the Kpi when sentiment custom field is missing', () => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: null,
            outcomeCustomFieldId: 0,
            intentCustomFieldId: 0,
            isLoading: false,
        })

        renderWithStore(<PositiveSentimentsPerProductKpiChart />, defaultState)

        expect(PositiveSentimentsPerProductKpiMock).not.toHaveBeenCalled()
    })

    it('should render the Kpi when sentiment custom field is available', () => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: sentimentCustomFieldId,
            outcomeCustomFieldId: 0,
            intentCustomFieldId: 0,
            isLoading: false,
        })

        renderWithStore(<PositiveSentimentsPerProductKpiChart />, defaultState)

        expect(PositiveSentimentsPerProductKpiMock).toHaveBeenCalledWith(
            {
                sentimentCustomFieldId,
                product,
            },
            {},
        )
    })
})
