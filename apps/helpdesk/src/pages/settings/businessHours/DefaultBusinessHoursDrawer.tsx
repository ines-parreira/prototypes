import { useRef } from 'react'

import {
    AccountSettingsItem,
    ListAccountSettings200DataItem,
} from '@gorgias/helpdesk-types'
import { validateUpdateAccountSettingBody } from '@gorgias/helpdesk-validators'
import { Button, IconButton, Label } from '@gorgias/merchant-ui-kit'

import { Drawer } from 'components/Drawer/Drawer'
import { Form, FormField, FormSubmitButton, toFormErrors } from 'core/forms'
import FormActionsGroup from 'core/forms/components/FormActionsGroup'
import useIsMounted from 'hooks/useIsMounted'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import TimeScheduleField from 'pages/common/components/TimeScheduleField/TimeScheduleField'
import SelectDropdownField from 'pages/common/forms/SelectDropdownField'
import { getMomentTimezoneNames } from 'utils/date'

import css from './DefaultBusinessHours.less'

type Props = {
    businessHoursSettingsData?: ListAccountSettings200DataItem
    updateAccountSetting: (data: {
        id: number
        data: AccountSettingsItem
    }) => void
    setIsDrawerOpen: (isOpen: boolean) => void
    isLoading: boolean
}

export const DefaultBusinessHoursDrawer = ({
    businessHoursSettingsData,
    updateAccountSetting,
    setIsDrawerOpen,
    isLoading,
}: Props) => {
    const isMounted = useIsMounted()
    const ref = useRef<HTMLDivElement>(null)

    const validator = (values: AccountSettingsItem) =>
        toFormErrors(validateUpdateAccountSettingBody(values))

    const onSubmit = (values: AccountSettingsItem) => {
        updateAccountSetting({
            id: businessHoursSettingsData!.id!,
            data: values,
        })
    }

    return (
        <Drawer.Content
            className={css.editBusinessHoursDrawer}
            aria-describedby="Edit default business hours"
            ref={ref}
        >
            {isMounted() && (
                <Form<AccountSettingsItem>
                    onValidSubmit={onSubmit}
                    mode="all"
                    defaultValues={businessHoursSettingsData}
                    validator={validator}
                    className={css.form}
                >
                    <Drawer.Title className={css.drawerHeader}>
                        <span>Edit default business hours</span>
                        <Drawer.Close asChild>
                            <IconButton
                                onClick={() => setIsDrawerOpen(false)}
                                icon="close"
                                intent="secondary"
                                fillStyle="ghost"
                                title="Close form"
                            />
                        </Drawer.Close>
                    </Drawer.Title>
                    <div className={css.drawerContent}>
                        <div>
                            <FormField
                                name="data.timezone"
                                label="Timezone"
                                field={SelectDropdownField}
                                options={getMomentTimezoneNames()}
                                isRequired
                                root={ref?.current ?? undefined}
                            />
                        </div>
                        <div className={css.schedule}>
                            <Label isRequired>Schedule</Label>
                            <TimeScheduleField
                                name="data.business_hours"
                                root={ref.current ?? undefined}
                                isRemovable
                            />
                        </div>
                        <FormUnsavedChangesPrompt onSave={onSubmit} />
                    </div>
                    <FormActionsGroup className={css.drawerFooter}>
                        <FormSubmitButton isLoading={isLoading}>
                            Save changes
                        </FormSubmitButton>
                        <Button
                            intent="secondary"
                            onClick={() => setIsDrawerOpen(false)}
                        >
                            Cancel
                        </Button>
                    </FormActionsGroup>
                </Form>
            )}
        </Drawer.Content>
    )
}
