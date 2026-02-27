import cn from 'classnames'

import { Banner, Box, Button } from '@gorgias/axiom'

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
    onOpportunityRemoved: () => void
}

export const OpportunityDetailsContent = ({
    selectedOpportunity,
    opportunityConfig,
    onTicketCountClick,
    onFormValuesChange,
    onOpportunityRemoved,
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
                        isInReadOnlyMode={
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
                        shopName={opportunityConfig.shopName}
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

    const isRelevant = selectedOpportunity?.isRelevant !== false

    return (
        <div className={css.contentBody}>
            {!isRelevant && (
                <div className={css.customBannerWrapper}>
                    <Banner
                        intent="info"
                        size="md"
                        isClosable={false}
                        icon="info"
                        description="This opportunity is no longer relevant and was addressed by recent knowledge updates."
                        variant="inline"
                    >
                        <Button
                            variant="tertiary"
                            size="sm"
                            onClick={onOpportunityRemoved}
                        >
                            Remove and View Next
                        </Button>
                    </Banner>
                </div>
            )}
            <div
                className={cn(
                    css.opportunityDetails,
                    !isRelevant && css.uninteractive,
                )}
            >
                <OpportunityDetailsCard
                    type={selectedOpportunity.type}
                    ticketCount={selectedOpportunity.ticketCount}
                    onTicketCountClick={onTicketCountClick}
                />
                <Box flexDirection="row" gap="md" flexWrap="wrap">
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
