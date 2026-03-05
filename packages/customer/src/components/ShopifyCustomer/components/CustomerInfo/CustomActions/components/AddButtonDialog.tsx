import { FormField, FormProvider, useController } from '@repo/forms'

import {
    Box,
    Button,
    ListItem,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SelectField,
    Separator,
    TextField,
} from '@gorgias/axiom'

import { HTTP_METHODS } from '../utils/customActionConstants'
import type { ButtonConfig, HttpMethod } from '../utils/customActionTypes'
import { isValidActionUrl } from '../utils/customActionUtils'
import { ParameterList } from './ParameterList'
import { RequestBodyEditor } from './RequestBodyEditor'
import { useButtonForm } from './useButtonForm'

type SelectItem = { id: string; name: string }

function MethodField() {
    const { field } = useController({ name: 'action.method' })
    const selectedMethod =
        HTTP_METHODS.find((m) => m.id === field.value) ?? HTTP_METHODS[0]

    return (
        <SelectField
            items={HTTP_METHODS}
            value={selectedMethod}
            onChange={(item: SelectItem) =>
                field.onChange(item.id as HttpMethod)
            }
            label="Method"
        >
            {(item: SelectItem) => <ListItem id={item.id} label={item.name} />}
        </SelectField>
    )
}

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (button: ButtonConfig) => Promise<void>
    initialButton?: ButtonConfig
}

export function AddButtonDialog(props: Props) {
    const {
        methods,
        isEditing,
        isValid,
        isSubmitting,
        hasBody,
        handleSave,
        handleCancel,
    } = useButtonForm(props)

    return (
        <Modal
            isOpen={props.isOpen}
            onOpenChange={handleCancel}
            size={ModalSize.Xl}
            aria-label={
                isEditing ? 'Edit HTTP action' : 'Configure HTTP action'
            }
        >
            <OverlayHeader
                title={isEditing ? 'Edit HTTP action' : 'Configure HTTP action'}
            />
            <OverlayContent>
                <FormProvider {...methods}>
                    <Box flexDirection="column" gap="lg" width="100%">
                        <FormField
                            name="label"
                            field={TextField}
                            label="Button title"
                            placeholder="Button label"
                            isRequired
                        />

                        <Box flexDirection="row" gap="sm" alignItems="flex-end">
                            <MethodField />
                            <Box flex={1}>
                                <FormField
                                    name="action.url"
                                    field={TextField}
                                    label="URL"
                                    placeholder="https://api.example.com/endpoint"
                                    validation={{
                                        validate: (value: string) =>
                                            isValidActionUrl(value) ||
                                            'Enter a valid URL',
                                    }}
                                />
                            </Box>
                        </Box>

                        <Separator />

                        <ParameterList name="action.headers" label="Headers" />

                        <Separator />

                        <ParameterList
                            name="action.params"
                            label="Query parameters"
                        />

                        {hasBody && (
                            <>
                                <Separator />
                                <RequestBodyEditor name="action.body" />
                            </>
                        )}
                    </Box>
                </FormProvider>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm">
                    <Button variant="tertiary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isDisabled={!isValid}
                        isLoading={isSubmitting}
                    >
                        Save
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
