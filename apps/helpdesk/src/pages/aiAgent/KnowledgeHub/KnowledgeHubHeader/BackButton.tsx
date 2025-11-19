import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeHubHeader.less'

type BackButtonProps = {
    onBack: () => void
    data: GroupedKnowledgeItem | null
}

export const BackButton = ({ data, onBack }: BackButtonProps) => {
    if (!data) {
        return null
    }
    return (
        <div
            onClick={onBack}
            aria-label="Back to Knowledge Hub"
            className={classNames(
                css.button,
                css.iconOnlyButton,
                css.backButton,
            )}
        >
            <Icon name="arrow-chevron-left" size="md" />
        </div>
    )
}
