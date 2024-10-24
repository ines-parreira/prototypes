import React, {useRef, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import ColorField from 'pages/common/forms/ColorField'

export const SUBMIT_TEXT = 'Submit'
export const CANCEL_TEXT = 'Cancel'

export type FormData = {
    color: string
}

type Props = {
    initialData: FormData
    onCancel: () => void
    onSubmit: (data: FormData) => void
}

const WrapperEditForm = ({initialData, onCancel, onSubmit}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [formData, setFormData] = useState<FormData>(initialData)

    return (
        <div ref={wrapperRef}>
            <form
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit(formData)
                }}
            >
                <ColorField
                    label="Border color"
                    value={formData.color}
                    onChange={(color: string) => {
                        setFormData((formState) => ({
                            ...formState,
                            color,
                        }))
                    }}
                    popupContainer={wrapperRef}
                />

                <div>
                    <Button type="submit" className="mr-2">
                        {SUBMIT_TEXT}
                    </Button>
                    <Button
                        intent="secondary"
                        onClick={(event) => {
                            event.stopPropagation()
                            onCancel()
                        }}
                    >
                        {CANCEL_TEXT}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default WrapperEditForm
