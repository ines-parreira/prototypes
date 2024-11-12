import React from 'react'
import {Controller, Control} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'

import {ActionsApp} from '../types'

type UrlInputProps = {
    control: Control<ActionsApp>
    name: 'auth_settings.url' | 'auth_settings.refresh_token_url'
    label: string
    caption?: string
    placeholder?: string
}

const UrlInput: React.FC<UrlInputProps> = ({
    control,
    name,
    label,
    caption = '',
    placeholder = '',
}) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: true,
                validate: (value) => {
                    if (!value) {
                        return false
                    }
                    try {
                        new URL(value)
                        return true
                    } catch {
                        return false
                    }
                },
            }}
            render={({field: {value, onChange}}) => (
                <InputField
                    isRequired
                    label={label}
                    value={value ?? ''}
                    onChange={onChange}
                    caption={caption}
                    placeholder={placeholder}
                />
            )}
        />
    )
}

export default UrlInput
