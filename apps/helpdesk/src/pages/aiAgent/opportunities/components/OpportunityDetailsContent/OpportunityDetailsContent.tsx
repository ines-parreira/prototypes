import { Box } from '@gorgias/axiom'

import { OpportunityType } from '../../enums'
import type {
    Opportunity,
    OpportunityConfig,
    OpportunityResource,
    ResourceFormFields,
} from '../../types'
import { ResourceType } from '../../types'
import { OpportunityArticleEditor } from '../OpportunityArticleEditor/OpportunityArticleEditor'
import { OpportunityDetailsCard } from '../OpportunityDetailsCard/OpportunityDetailsCard'
import { OpportunityGuidanceEditor } from '../OpportunityGuidanceEditor/OpportunityGuidanceEditor'
import { OpportunitySnippetEditor } from '../OpportunitySnippetEditor/OpportunitySnippetEditor'

import css from './OpportunityDetailsContent.less'

interface OpportunityDetailsContentProps {
    selectedOpportunity: Opportunity
    opportunityConfig: OpportunityConfig
    onTicketCountClick: () => void
    onFormValuesChange: (
        resourceIndex: number,
        fields: ResourceFormFields,
    ) => void
}

export const OpportunityDetailsContent = ({
    selectedOpportunity,
    opportunityConfig,
    onTicketCountClick,
    onFormValuesChange,
}: OpportunityDetailsContentProps) => {
    const renderResourceEditor = (
        resource: OpportunityResource,
        index: number,
    ) => {
        const key = `${selectedOpportunity.key}-${index}`

        switch (resource.type) {
            case ResourceType.GUIDANCE:
                return (
                    <OpportunityGuidanceEditor
                        key={key}
                        resource={resource}
                        shopName={opportunityConfig.shopName}
                        onValuesChange={(fields) =>
                            onFormValuesChange(index, fields)
                        }
                        isInGuidanceEditorModeOnly={
                            selectedOpportunity.type ===
                            OpportunityType.FILL_KNOWLEDGE_GAP
                        }
                    />
                )
            case ResourceType.ARTICLE:
                return (
                    <OpportunityArticleEditor
                        key={key}
                        resource={resource}
                        onValuesChange={(fields) =>
                            onFormValuesChange(index, fields)
                        }
                    />
                )
            case ResourceType.EXTERNAL_SNIPPET:
                return (
                    <OpportunitySnippetEditor
                        key={key}
                        resource={resource}
                        shopName={opportunityConfig.shopName}
                        onValuesChange={(fields) =>
                            onFormValuesChange(index, fields)
                        }
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className={css.contentBody}>
            <div className={css.opportunityDetails}>
                <OpportunityDetailsCard
                    type={selectedOpportunity.type}
                    ticketCount={selectedOpportunity.ticketCount}
                    onTicketCountClick={onTicketCountClick}
                />
                <Box flexDirection="row" gap="md">
                    {selectedOpportunity.resources.map((resource, index) => (
                        <div
                            key={`${selectedOpportunity.key}-${index}`}
                            className={css.resourceEditor}
                        >
                            {renderResourceEditor(resource, index)}
                        </div>
                    ))}
                </Box>
            </div>
        </div>
    )
}
