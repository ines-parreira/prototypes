import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

import { TestButton } from './KnowledgeEditorTopBarCommonControls'

import css from './KnowledgeEditorTopBarControls.less'

type Props = {
    onTest: () => void
    isPlaygroundOpen?: boolean
}

export const KnowledgeEditorTopBarSnippetControls = ({
    onTest,
    isPlaygroundOpen = false,
}: Props) => (
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
        {!isPlaygroundOpen && <TestButton onTest={onTest} disabled={false} />}
    </>
)
