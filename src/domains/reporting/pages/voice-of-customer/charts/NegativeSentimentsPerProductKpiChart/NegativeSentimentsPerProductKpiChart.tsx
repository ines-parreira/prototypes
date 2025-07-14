import { NegativeSentimentsPerProductKpi } from 'domains/reporting/pages/voice-of-customer/charts/NegativeSentimentsPerProductKpiChart/NegativeSentimentsPerProductKpi'
import { getSidePanelProduct } from 'domains/reporting/state/ui/stats/sidePanelSlice'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const NegativeSentimentsPerProductKpiChart = () => {
    const product = useAppSelector(getSidePanelProduct)
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <>
            {sentimentCustomFieldId && product ? (
                <NegativeSentimentsPerProductKpi
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    product={product}
                />
            ) : null}
        </>
    )
}
