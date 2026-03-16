import { FormField, FormProvider } from '@repo/forms'

import {
    Box,
    Button,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    TextField,
} from '@gorgias/axiom'

import type { LinkConfig } from '../utils/customActionTypes'
import { isValidLinkUrl } from '../utils/customActionUtils'
import { useLinkForm } from './useLinkForm'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (link: LinkConfig) => Promise<void>
    editLink?: LinkConfig
}

export function LinkActionDialog(props: Props) {
    const {
        methods,
        isEditing,
        isValid,
        isSubmitting,
        handleSave,
        handleCancel,
        handleUrlBlur,
    } = useLinkForm(props)

    return (
        <Modal
            isOpen={props.isOpen}
            onOpenChange={handleCancel}
            size={ModalSize.Sm}
            aria-label={isEditing ? 'Edit link' : 'Add link'}
        >
            <OverlayHeader title={isEditing ? 'Edit link' : 'Add link'} />
            <OverlayContent>
                <FormProvider {...methods}>
                    <Box flexDirection="column" gap="sm" width="100%">
                        <FormField
                            name="label"
                            field={TextField}
                            label="Title"
                            placeholder="Link title"
                            isRequired
                        />
                        <div onBlur={handleUrlBlur}>
                            <FormField
                                name="url"
                                field={TextField}
                                label="URL"
                                placeholder="https://example.com"
                                isRequired
                                validation={{
                                    validate: (value: string) =>
                                        isValidLinkUrl(value) ||
                                        'Enter a valid URL',
                                }}
                            />
                        </div>
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
