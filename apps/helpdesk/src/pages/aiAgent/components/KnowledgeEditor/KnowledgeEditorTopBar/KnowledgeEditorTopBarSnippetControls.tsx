import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

import { TestButton } from './KnowledgeEditorTopBarCommonControls'

import css from './KnowledgeEditorTopBarControls.less'

type Props = {
    onTest: () => void
}

export const KnowledgeEditorTopBarSnippetControls = (props: Props) => (
    <>
        <button
            className={classNames(
                css.button,
                css.ghostButton,
                css.iconWithTextButton,
            )}
            disabled
        >
            <Icon name="lock" aria-label="editing disabled" /> Edit
        </button>
        <TestButton onTest={props.onTest} disabled={false} />
    </>
)
