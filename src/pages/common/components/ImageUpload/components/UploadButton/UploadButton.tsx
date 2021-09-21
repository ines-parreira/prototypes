import React, {createRef, FunctionComponent, ChangeEvent} from 'react'

import css from './UploadButton.less'

export type UploadButtonProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange'
> & {
    name: string
    onChange?: (
        event: ChangeEvent<HTMLInputElement>,
        ref: HTMLInputElement | null
    ) => void
}

export const UploadButton: FunctionComponent<UploadButtonProps> = ({
    name,
    onChange,
    ...props
}: UploadButtonProps) => {
    const inputRef = createRef<HTMLInputElement>()

    return (
        <>
            <label htmlFor={name}>
                <div className={css.fakeBtn}>
                    <span className="material-icons mr-2">attachment</span>
                    Upload
                </div>
            </label>
            <input
                {...props}
                ref={inputRef}
                accept="image/png"
                type="file"
                name={name}
                id={name}
                style={{display: 'none'}}
                onChange={(...args) => {
                    if (onChange) {
                        onChange(...args, inputRef.current)
                    }
                }}
            />
        </>
    )
}
