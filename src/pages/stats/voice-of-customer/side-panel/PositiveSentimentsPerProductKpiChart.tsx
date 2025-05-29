import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { PositiveSentimentsPerProductKpi } from 'pages/stats/voice-of-customer/side-panel/PositiveSentimentsPerProductKpi'
import { getSidePanelProductId } from 'state/ui/stats/sidePanelSlice'

export const PositiveSentimentsPerProductKpiChart = () => {
    const productId = useAppSelector(getSidePanelProductId)
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <>
            {sentimentCustomFieldId && productId ? (
                <PositiveSentimentsPerProductKpi
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    productId={productId}
                />
            ) : null}
        </>
    )
}
