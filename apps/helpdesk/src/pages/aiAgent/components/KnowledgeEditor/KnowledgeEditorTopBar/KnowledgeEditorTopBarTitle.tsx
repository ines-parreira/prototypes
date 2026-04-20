import classNames from 'classnames'

import { Text } from '@gorgias/axiom'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import css from './KnowledgeEditorTopBarTitle.less'

type Props = {
    onChangeTitle?: (newTitle: string) => void
    title: string
}

export const KnowledgeEditorTopBarTitle = ({ title, onChangeTitle }: Props) => {
    if (!onChangeTitle) {
        return (
            <TruncatedTextWithTooltip tooltipContent={title}>
                <span className={css.title}>{title}</span>
            </TruncatedTextWithTooltip>
        )
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
