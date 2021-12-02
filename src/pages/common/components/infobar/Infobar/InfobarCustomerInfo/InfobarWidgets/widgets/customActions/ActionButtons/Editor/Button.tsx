import React, {memo, useCallback} from 'react'
import {Button as BasicButton, ListGroupItem} from 'reactstrap'
import {Map} from 'immutable'

import {renderTemplate} from '../../../../../../../../../utils/template'
import {Button as ButtonType, OnOpenForm, OnRemoveButton} from '../../types'

import css from '../ActionButtons.less'

type ButtonProps = {
    index: number
    button: ButtonType
    source: Map<string, unknown>
    onRemove: OnRemoveButton
    onOpenForm: OnOpenForm
}

function Button(props: ButtonProps) {
    const {
        index,
        button: {label},
        source,
        onRemove,
        onOpenForm,
    } = props
    const handleRemove = useCallback(() => onRemove(index), [index, onRemove])
    return (
        <>
            <ListGroupItem className={css.editRow}>
                <BasicButton type="button" onClick={() => onOpenForm(index)}>
                    {renderTemplate(label, source.toJS())}
                </BasicButton>
                <span className={css.editIcons}>
                    <i
                        className="material-icons text-faded clickable"
                        onClick={() => onOpenForm(index)}
                    >
                        settings
                    </i>
                    <i
                        className="material-icons text-danger clickable"
                        onClick={handleRemove}
                    >
                        close
                    </i>
                </span>
            </ListGroupItem>
        </>
    )
}

export default memo(Button)
