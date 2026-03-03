import { history } from '@repo/routing'

import {
    LegacyButton as Button,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import BackLink from 'pages/common/components/BackLink'

import { GuidanceAiSuggestionsList } from './components/GuidanceAiSuggestionsList/GuidanceAiSuggestionsList'
import { GuidanceTemplatesList } from './components/GuidanceTemplatesList/GuidanceTemplatesList'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'
import { useGuidanceAiSuggestions } from './hooks/useGuidanceAiSuggestions'
import { useGuidanceTemplates } from './hooks/useGuidanceTemplates'

import css from './AiAgentGuidanceLibrary.less'

type Props = {
    helpCenterId: number
    shopName: string
}

export const AiAgentGuidanceLibrary = ({ helpCenterId, shopName }: Props) => {
    const { guidanceTemplates } = useGuidanceTemplates()
    const { routes } = useAiAgentNavigation({ shopName })

    const { guidanceAISuggestions, isLoadingAiGuidances } =
        useGuidanceAiSuggestions({
            helpCenterId,
            shopName,
        })

    const onNewClick = () => {
        history.push(routes.newGuidanceArticle)
    }

    if (isLoadingAiGuidances) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <>
            <div className={css.guidanceLibraryHeader}>
                <BackLink path={routes.guidance} label="Back to Guidance" />
                <Button intent="secondary" onClick={onNewClick}>
                    Create Custom Guidance
                </Button>
            </div>

            <div className="mb-4">
                <h3 className="heading-section-semibold mb-1">
                    <span className={css.icon}>
                        <i className="material-icons">auto_awesome</i>
                    </span>
                    AI-generated Guidance based on your tickets
                </h3>
                {guidanceAISuggestions?.length > 0 && (
                    <p className={css.subtitle}>
                        You may already have an existing Guidance addressing one
                        of these topics. Make sure to double check first before
                        creating a new one.
                    </p>
                )}
                <GuidanceAiSuggestionsList
                    guidanceAiSuggestions={guidanceAISuggestions}
                    shopName={shopName}
                    showBanner
                />
            </div>

            <h3 className="heading-section-semibold mb-0">
                Choose a template and customize it to fit your needs
            </h3>

            <GuidanceTemplatesList
                guidanceTemplates={guidanceTemplates}
                shopName={shopName}
            />
        </>
    )
}
