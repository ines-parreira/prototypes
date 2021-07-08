import React from 'react'
import {FormFeedback, FormGroup, Input} from 'reactstrap'

import {isUrl} from '../../../../../utils'

import css from './LinkItem.less'

export type LinkEntity = {
    id: number
    label: string
    value: string
}

export type LinkItemEventHandlers = {
    onBlur: (
        ev: React.FocusEvent<HTMLInputElement>,
        key: 'label' | 'value',
        id: number
    ) => void
    onDelete: (id: number) => void
}

type Props = LinkEntity &
    LinkItemEventHandlers & {
        titlePlaceholder?: string
        urlPlaceholder?: string
    }

export const LinkItem = ({
    id,
    label,
    titlePlaceholder,
    value,
    urlPlaceholder,
    onBlur,
    onDelete,
}: Props) => {
    let valueErrMessage = ''
    let labelErrMessage = ''

    if (label && value === '') {
        valueErrMessage = 'URL is required if Title is defined'
    } else if (value !== '' && !isUrl(value)) {
        valueErrMessage = 'URL is invalid'
    }

    if (value && label === '') {
        labelErrMessage = 'Title is required if URL is defined'
    }

    return (
        <div data-testid={`link-item-${id}`} className={css['link-item']}>
            <FormGroup>
                <Input
                    defaultValue={label}
                    invalid={!!labelErrMessage}
                    placeholder={titlePlaceholder}
                    className={css['link-input']}
                    onBlur={(ev) => {
                        ev.persist()
                        onBlur(ev, 'label', id)
                    }}
                />
                {!!labelErrMessage && (
                    <FormFeedback>{labelErrMessage}</FormFeedback>
                )}
            </FormGroup>
            <FormGroup>
                <Input
                    defaultValue={value}
                    invalid={!!valueErrMessage}
                    placeholder={urlPlaceholder}
                    className={css['link-input']}
                    onBlur={(ev) => {
                        ev.persist()
                        onBlur(ev, 'value', id)
                    }}
                />
                {!!valueErrMessage && (
                    <FormFeedback>{valueErrMessage}</FormFeedback>
                )}
            </FormGroup>
            <i className="material-icons" onClick={() => onDelete(id)}>
                close
            </i>
        </div>
    )
}
