import { Icon } from '@gorgias/axiom'

import css from './LoadingDraftKnowledge.less'

type LoadingDraftKnowledgeProps = {
    title?: string
    subtitle?: string
}

export const LoadingDraftKnowledge = ({
    title = 'Preview customer experience',
    subtitle = 'Ask questions like a customer would and see exactly how AI Agent responds. Use this to fine-tune knowledge, tone, and accuracy.',
}: LoadingDraftKnowledgeProps) => {
    return (
        <div className={css.container} role="status" aria-live="polite">
            <div className={css.icon}>
                <Icon name="ai-alt-1" size="md" />
            </div>
            <div className={css.content}>
                <div className={css.title}>{title}</div>
                <div className={css.subtitle}>{subtitle}</div>
            </div>
        </div>
    )
}
