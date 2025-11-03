import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { Icon } from '@gorgias/axiom'

import { GroupedKnowledgeItem } from '../types'

import css from './KnowledgeHubHeader.less'

type BackButtonProps = {
    knowledgeRoute: string
    data: GroupedKnowledgeItem | null
}

export const BackButton = ({ knowledgeRoute, data }: BackButtonProps) => {
    if (!data) {
        return null
    }
    return (
        <Link
            to={knowledgeRoute}
            className={classNames(
                css.button,
                css.iconOnlyButton,
                css.backButton,
            )}
            aria-label="Back to Knowledge Hub"
        >
            <Icon size={'md'} name="arrow-chevron-left" />
        </Link>
    )
}
