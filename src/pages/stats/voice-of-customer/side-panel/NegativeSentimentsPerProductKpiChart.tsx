import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { NegativeSentimentsPerProductKpi } from 'pages/stats/voice-of-customer/side-panel/NegativeSentimentsPerProductKpi'
import { getSidePanelProductId } from 'state/ui/stats/sidePanelSlice'

export const NegativeSentimentsPerProductKpiChart = () => {
    const productId = useAppSelector(getSidePanelProductId)
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <>
            {sentimentCustomFieldId && productId ? (
                <NegativeSentimentsPerProductKpi
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    productId={productId}
                />
            ) : null}
        </>
    )
}
