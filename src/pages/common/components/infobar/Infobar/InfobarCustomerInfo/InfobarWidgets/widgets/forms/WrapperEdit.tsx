import React, {
    useCallback,
    useRef,
    useState,
    MouseEvent,
    FormEvent,
    memo,
} from 'react'
import {Map} from 'immutable'
import {Form, Button} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {updateEditedWidget, stopWidgetEdition} from 'state/widgets/actions'
import {WidgetTemplateType} from 'state/widgets/types'
import ColorField from 'pages/common/forms/ColorField'

type Props = {
    template: Map<string, unknown>
    onClose: () => void
}

type FormState = {
    color: string
}

const PopoverEditWrapper = ({template, onClose}: Props) => {
    const dispatch = useAppDispatch()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [formState, setFormState] = useState<FormState>({
        color: template.getIn(['meta', 'color'], ''),
    })

    const handleClose = useCallback(
        (evt?: MouseEvent<HTMLButtonElement>) => {
            if (evt) {
                evt.stopPropagation()
            }
            dispatch(stopWidgetEdition())
            onClose()
        },
        [dispatch, onClose]
    )

    const handleSubmit = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()

            const wrapper = {
                type: WidgetTemplateType.Wrapper,
                meta: {
                    color: formState.color,
                },
            }

            dispatch(updateEditedWidget(wrapper))

            handleClose()
        },
        [formState, dispatch, handleClose]
    )

    return (
        <div ref={wrapperRef}>
            <Form onSubmit={handleSubmit}>
                <ColorField
                    label="Border color"
                    value={formState.color}
                    onChange={(color: string) => {
                        setFormState((formState) => ({
                            ...formState,
                            color,
                        }))
                    }}
                    popupContainer={wrapperRef}
                />

                <div>
                    <Button color="primary" type="submit" className="mr-2">
                        Submit
                    </Button>
                    <Button
                        color="secondary"
                        type="button"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default memo(PopoverEditWrapper)
