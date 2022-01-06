import React, {memo, useCallback, useMemo} from 'react'
import {Button as BasicButton, ListGroupItem} from 'reactstrap'
import {Map} from 'immutable'
import {useSelector} from 'react-redux'

import {renderTemplate} from '../../../../../../../../../utils/template'
import {getTicket} from '../../../../../../../../../../../state/ticket/selectors'
import {getActiveCustomer} from '../../../../../../../../../../../state/customers/selectors'
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

    const ticket = useSelector(getTicket)
    const user = useSelector(getActiveCustomer)
    const templateContext = useMemo(() => {
        return {
            ...(source.toJS() as Record<string, unknown>),
            ticket,
            user,
        }
    }, [user, source, ticket])

    const handleRemove = useCallback(() => onRemove(index), [index, onRemove])

    return (
        <>
            <ListGroupItem className={css.editRow}>
                <BasicButton type="button" onClick={() => onOpenForm(index)}>
                    {renderTemplate(label, templateContext)}
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
