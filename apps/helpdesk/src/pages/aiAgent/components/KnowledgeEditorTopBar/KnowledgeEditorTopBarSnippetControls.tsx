import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

import css from './KnowledgeEditorTopBarControls.less'

export const KnowledgeEditorTopBarSnippetControls = () => (
    <button
        className={classNames(
            css.button,
            css.secondaryButton,
            css.iconWithTextButton,
        )}
        disabled
    >
        <Icon name="lock" aria-label="editing disabled" /> Edit
    </button>
)
