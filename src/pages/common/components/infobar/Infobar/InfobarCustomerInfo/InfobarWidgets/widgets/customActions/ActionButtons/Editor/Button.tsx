import React, { memo, useCallback, useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { isSourceRecord, Source } from 'models/widget/types'
import BasicButton from 'pages/common/components/button/Button'
import {
    Button as ButtonType,
    OnOpenForm,
    OnRemoveButton,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import { renderTemplate } from 'pages/common/utils/template'
import { getActiveCustomer } from 'state/customers/selectors'
import { getTicket } from 'state/ticket/selectors'

import './Button.less'

type ButtonProps = {
    index: number
    button: ButtonType
    source: Source
    onRemove: OnRemoveButton
    onOpenForm: OnOpenForm
}

function Button(props: ButtonProps) {
    const {
        index,
        button: { label },
        source,
        onRemove,
        onOpenForm,
    } = props

    const ticket = useAppSelector(getTicket)
    const user = useAppSelector(getActiveCustomer)
    const templateContext = useMemo(() => {
        return {
            ...(isSourceRecord(source) ? source : {}),
            ticket,
            user,
        }
    }, [user, source, ticket])

    const handleRemove = useCallback(() => onRemove(index), [index, onRemove])

    return (
        <>
            <BasicButton
                type="button"
                intent="secondary"
                size="small"
                onClick={() => onOpenForm(index)}
            >
                {renderTemplate(label, templateContext)}
            </BasicButton>
            <span className="customActionEditIcons">
                <i className="material-icons" onClick={() => onOpenForm(index)}>
                    edit
                </i>
                <i
                    className="material-icons text-danger"
                    onClick={handleRemove}
                >
                    delete
                </i>
            </span>
        </>
    )
}

export default memo(Button)
