import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { PositiveSentimentsPerProductKpi } from 'pages/stats/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi'
import { getSidePanelProduct } from 'state/ui/stats/sidePanelSlice'

export const PositiveSentimentsPerProductKpiChart = () => {
    const product = useAppSelector(getSidePanelProduct)
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <>
            {sentimentCustomFieldId && product ? (
                <PositiveSentimentsPerProductKpi
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    product={product}
                />
            ) : null}
        </>
    )
}
