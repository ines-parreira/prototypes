import classNames from 'classnames'

import { Text } from '@gorgias/axiom'

import css from './KnowledgeEditorTopBarTitle.less'

type Props = {
    onChangeTitle?: (newTitle: string) => void
    title: string
}

export const KnowledgeEditorTopBarTitle = ({ title, onChangeTitle }: Props) => {
    if (!onChangeTitle) {
        return <span className={css.title}>{title}</span>
    }

    return (
        <div className={css.editableTitleWrapper}>
            {!title && (
                <div className={css.placeholder} aria-hidden="true">
                    <span>Untitled</span>
                    <Text size="md" color="content-error-default">
                        *
                    </Text>
                </div>
            )}
            <input
                type="text"
                name="title"
                aria-label="title"
                value={title}
                className={classNames(css.title, css.editableTitle)}
                onChange={(event) => onChangeTitle(event.target.value)}
            />
        </div>
    )
}
