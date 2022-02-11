import React from 'react'
import {FormText} from 'reactstrap'
import {defined} from 'utils'

import SelectField from '../../../../common/forms/SelectField/SelectField'
import {Value} from '../../../../common/forms/SelectField/types'

type Props = {
    title: string
    help?: string
    value: Value
    fontOptions: string[]
    onChange: (value: string) => void
}

export const FontSelectField = ({
    title,
    help,
    value,
    onChange,
    fontOptions,
}: Props) => {
    return (
        <>
            <label className="control-label">{title}</label>
            <SelectField
                fullWidth
                placeholder="Select a primary font"
                value={value}
                onChange={(value) => {
                    onChange(value as string)
                }}
                options={fontOptions.map((fontName) => ({
                    value: fontName,
                    label: (
                        <span style={{fontFamily: fontName}}>{fontName}</span>
                    ),
                }))}
            />
            {defined(help) && <FormText color="muted">{help}</FormText>}
        </>
    )
}
