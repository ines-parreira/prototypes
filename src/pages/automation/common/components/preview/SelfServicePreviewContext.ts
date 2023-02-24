import {createContext, useContext} from 'react'

import {
    PolicyKey,
    QuickResponsePolicy,
    ResponseMessageContent,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'

export type SelfServicePreviewContextType = {
    selfServiceConfiguration: SelfServiceConfiguration
    quickResponse?: QuickResponsePolicy
    hoveredQuickResponseId?: Maybe<QuickResponsePolicy['id']>
    hoveredOrderManagementFlow?: Maybe<PolicyKey>
    orderManagementFlow?: PolicyKey
    automatedResponseMessageContent?: ResponseMessageContent
}

const SelfServicePreviewContext = createContext<
    SelfServicePreviewContextType | undefined
>(undefined)

export const useSelfServicePreviewContext = () => {
    const selfServicePreviewContext = useContext(SelfServicePreviewContext)

    if (!selfServicePreviewContext) {
        throw new Error(
            'SelfServicePreview context is undefined, please verify you are calling useSelfServicePreviewContext() as child of a <SelfServicePreviewContext.Provider>'
        )
    }

    return selfServicePreviewContext
}

export default SelfServicePreviewContext
