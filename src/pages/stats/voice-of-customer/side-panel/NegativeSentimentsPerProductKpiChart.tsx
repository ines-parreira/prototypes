import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { NegativeSentimentsPerProductKpi } from 'pages/stats/voice-of-customer/side-panel/NegativeSentimentsPerProductKpi'
import { getSidePanelProduct } from 'state/ui/stats/sidePanelSlice'

export const NegativeSentimentsPerProductKpiChart = () => {
    const product = useAppSelector(getSidePanelProduct)
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <>
            {sentimentCustomFieldId && product ? (
                <NegativeSentimentsPerProductKpi
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    productId={product.id}
                />
            ) : null}
        </>
    )
}
