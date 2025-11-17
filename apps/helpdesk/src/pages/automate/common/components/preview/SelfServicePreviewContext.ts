import { createContext, useContext } from 'react'

import type {
    PolicyKey,
    ReportIssueCaseReason,
    ResponseMessageContent,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'

export type SelfServicePreviewContextType = {
    selfServiceConfiguration?: SelfServiceConfiguration
    hoveredOrderManagementFlow?: Maybe<PolicyKey>
    hasHoveredReportOrderIssueScenario?: boolean
    orderManagementFlow?: PolicyKey
    automatedResponseMessageContent?: ResponseMessageContent
    reportOrderIssueReasons?: ReportIssueCaseReason['reasonKey'][]
    reportOrderIssueReason?: ReportIssueCaseReason
    hoveredReportOrderIssueReason?: Maybe<ReportIssueCaseReason['reasonKey']>
    isArticleRecommendationEnabled?: boolean
    workflowsEntrypoints?: { workflow_id: string; enabled: boolean }[]
}

const SelfServicePreviewContext = createContext<
    SelfServicePreviewContextType | undefined
>(undefined)

export const useSelfServicePreviewContext = () => {
    const selfServicePreviewContext = useContext(SelfServicePreviewContext)

    if (!selfServicePreviewContext) {
        throw new Error(
            'SelfServicePreview context is undefined, please verify you are calling useSelfServicePreviewContext() as child of a <SelfServicePreviewContext.Provider>',
        )
    }

    return selfServicePreviewContext
}

export default SelfServicePreviewContext
