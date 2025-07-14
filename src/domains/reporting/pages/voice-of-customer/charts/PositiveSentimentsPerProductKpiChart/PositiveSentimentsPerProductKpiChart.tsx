import { PositiveSentimentsPerProductKpi } from 'domains/reporting/pages/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi'
import { getSidePanelProduct } from 'domains/reporting/state/ui/stats/sidePanelSlice'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

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
