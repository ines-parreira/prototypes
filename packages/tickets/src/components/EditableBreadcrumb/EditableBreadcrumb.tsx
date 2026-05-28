import cn from 'classnames'

import { Icon } from '@gorgias/axiom'

import { useEditableBreadcrumb } from './useEditableBreadcrumb'

import css from './EditableBreadcrumb.less'

type Props = {
    value: string | null
    placeholder?: string
    onChange?: (value: string) => void
    autoFocus?: boolean
}

export function EditableBreadcrumb({
    value,
    placeholder,
    onChange,
    autoFocus,
}: Props) {
    const {
        subjectRef,
        handleMouseDown,
        handleFocus,
        handleBlur,
        handlePaste,
        handleKeyDown,
        handleInput,
        handleEditClick,
    } = useEditableBreadcrumb({ value, onChange, autoFocus })

    return (
        <div className={css.container} onMouseDown={handleMouseDown}>
            <span
                contentEditable
                className={cn(css.content, 'typography-medium-md')}
                ref={subjectRef}
                data-placeholder={placeholder}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                suppressContentEditableWarning={true}
                role="textbox"
            >
                {value}
            </span>
            <span className={css.editPencil} onClick={handleEditClick}>
                <Icon name="edit-pencil" size="sm" />
            </span>
        </div>
    )
}
