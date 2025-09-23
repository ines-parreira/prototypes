import classNames from 'classnames'

import css from './KnowledgeEditorTopBarTitle.less'

type Props = {
    onChangeTitle?: (newTitle: string) => void
    title: string
}

export const KnowledgeEditorTopBarTitle = ({ title, onChangeTitle }: Props) =>
    onChangeTitle ? (
        <input
            type="text"
            name="title"
            value={title}
            className={classNames(css.title, css.editableTitle)}
            onChange={(event) => onChangeTitle(event.target.value)}
        />
    ) : (
        <span className={css.title}>{title}</span>
    )
