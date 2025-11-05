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
            aria-label="title"
            placeholder="Title"
            value={title}
            className={classNames(css.title, css.editableTitle)}
            onChange={(event) => onChangeTitle(event.target.value)}
        />
    ) : (
        <span className={css.title}>{title}</span>
    )
