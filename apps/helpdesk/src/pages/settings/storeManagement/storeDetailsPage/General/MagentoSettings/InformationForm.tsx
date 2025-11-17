import type React from 'react'

import { Link } from 'react-router-dom'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { FormField } from 'core/forms'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

import SyncNotificationNew from '../ShopifySettings/SyncNotificationNew'

import css from './BaseForm.less'

export interface StoreInformationFormProps {
    storeURL: string
    isActive: boolean
    isSyncComplete: boolean
    storeId: number
    children?: React.ReactNode
}

export function InformationForm({
    storeURL,
    isSyncComplete,
    storeId,
    children,
    isActive,
}: StoreInformationFormProps) {
    return (
        <SettingsCard>
            <SettingsCardHeader>
                <SettingsCardTitle>Store Information</SettingsCardTitle>
                <p>
                    View your store details and manage how data is shared with
                    Gorgias. You can also access this information in
                    <Link to={`/app/settings/integrations/magento2/${storeId}`}>
                        {' '}
                        My Apps.
                    </Link>
                </p>
            </SettingsCardHeader>
            <SettingsCardContent>
                <div>
                    <SyncNotificationNew
                        isActive={isActive}
                        platform="Magento"
                        shopName={storeURL}
                        isSyncComplete={isSyncComplete}
                    />
                    <div className={css.magentoAdminURL}>
                        <Label isRequired>Store admin URL</Label>
                        <InputGroup>
                            <GroupAddon>{`https://${storeURL}/`}</GroupAddon>
                            <FormField
                                name="adminURLSuffix"
                                field={TextInput}
                                placeholder="ex: admin_45f1c"
                                isRequired
                            />
                        </InputGroup>
                    </div>
                </div>
                <div>{children}</div>
            </SettingsCardContent>
        </SettingsCard>
    )
}
