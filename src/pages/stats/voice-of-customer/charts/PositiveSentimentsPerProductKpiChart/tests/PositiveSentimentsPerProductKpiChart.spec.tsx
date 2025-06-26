import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { PositiveSentimentsPerProductKpi } from 'pages/stats/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi'
import { PositiveSentimentsPerProductKpiChart } from 'pages/stats/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpiChart'
import { RootState } from 'state/types'
import { initialState, sidePanelSlice } from 'state/ui/stats/sidePanelSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

jest.mock(
    'pages/stats/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi',
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
        })

        renderWithStore(<PositiveSentimentsPerProductKpiChart />, defaultState)

        expect(PositiveSentimentsPerProductKpiMock).not.toHaveBeenCalled()
    })

    it('should render the Kpi when sentiment custom field is available', () => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: sentimentCustomFieldId,
            outcomeCustomFieldId: 0,
            intentCustomFieldId: 0,
        })

        renderWithStore(<PositiveSentimentsPerProductKpiChart />, defaultState)

        expect(PositiveSentimentsPerProductKpiMock).toHaveBeenCalledWith(
            {
                sentimentCustomFieldId,
                productId,
            },
            {},
        )
    })
})
