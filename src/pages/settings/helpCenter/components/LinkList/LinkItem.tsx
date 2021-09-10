import React from 'react'
import {FormFeedback, FormGroup, Input} from 'reactstrap'
import isUrl from 'validator/lib/isURL'

import css from './LinkItem.less'

export type LinkEntity = {
    id: number
    key: string
    label: string
    value: string
}

export type LinkItemEventHandlers = {
    onChange: (
        ev: React.ChangeEvent<HTMLInputElement>,
        key: 'label' | 'value',
        id: number
    ) => void
    onDelete: (id: number) => void
}

export type Props = LinkEntity &
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
    onChange,
    onDelete,
}: Props): JSX.Element => {
    let valueErrMessage = ''
    let labelErrMessage = ''

    if (label && value === '') {
        valueErrMessage = 'Please enter a valid URL'
    } else if (value !== '' && !isUrl(value)) {
        valueErrMessage = 'URL is invalid'
    }

    if (value && label === '') {
        labelErrMessage = 'Please enter a valid title'
    }

    return (
        <div data-testid={`link-item-${id}`} className={css['link-item']}>
            <FormGroup>
                <Input
                    value={label}
                    data-testid={`link-item-label-${id}`}
                    invalid={!!labelErrMessage}
                    placeholder={titlePlaceholder}
                    className={css['link-input']}
                    onChange={(ev) => {
                        ev.persist()
                        onChange(ev, 'label', id)
                    }}
                />
                {!!labelErrMessage && (
                    <FormFeedback data-testid={`link-item-label-error-${id}`}>
                        {labelErrMessage}
                    </FormFeedback>
                )}
            </FormGroup>
            <FormGroup>
                <Input
                    value={value}
                    data-testid={`link-item-value-${id}`}
                    invalid={!!valueErrMessage}
                    placeholder={urlPlaceholder}
                    className={css['link-input']}
                    onChange={(ev) => {
                        ev.persist()
                        onChange(ev, 'value', id)
                    }}
                />
                {!!valueErrMessage && (
                    <FormFeedback data-testid={`link-item-value-error-${id}`}>
                        {valueErrMessage}
                    </FormFeedback>
                )}
            </FormGroup>
            <i className="material-icons" onClick={() => onDelete(id)}>
                close
            </i>
        </div>
    )
}
