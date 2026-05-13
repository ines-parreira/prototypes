import { TextField } from '@gorgias/axiom'

type Props = {
    value: string
    onChange: (next: string) => void
    onBlur?: () => void
    error?: string
    autoFocus?: boolean
    label?: string
    placeholder?: string
    caption?: string
}

export const ActionNameField = ({
    value,
    onChange,
    onBlur,
    error,
    autoFocus,
    label = 'Action name',
    placeholder,
    caption,
}: Props) => {
    return (
        <TextField
            label={label}
            isRequired
            placeholder={placeholder}
            caption={caption}
            error={error}
            autoFocus={autoFocus}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    )
}
