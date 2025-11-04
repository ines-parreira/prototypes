import React from 'react'

import { Link } from 'react-router-dom'

import { LegacyLabel as Label } from '@gorgias/axiom'

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

import css from '../ShopifySettings/StoreInformationForm.less'

export interface StoreInformationFormProps {
    shopName: string
    isSyncComplete: boolean
    storeId: number
    isActive: boolean
}

export function InformationForm({
    shopName,
    isSyncComplete,
    storeId,
    isActive,
}: StoreInformationFormProps) {
    return (
        <SettingsCard>
            <SettingsCardHeader>
                <SettingsCardTitle>Store Information</SettingsCardTitle>
                <p>
                    View your store details and manage how data is shared with
                    Gorgias. You can also access this information in
                    <Link
                        to={`/app/settings/integrations/bigcommerce/${storeId}`}
                    >
                        {' '}
                        My Apps.
                    </Link>
                </p>
            </SettingsCardHeader>
            <SettingsCardContent>
                <div className={css.metaContainer}>
                    <SyncNotificationNew
                        isActive={isActive}
                        platform="BigCommerce"
                        shopName={shopName}
                        isSyncComplete={isSyncComplete}
                    />
                    <div className={css.storeName}>
                        <Label htmlFor="store-name">Store name</Label>
                        <InputGroup isDisabled>
                            <TextInput name="store-name" value={shopName} />
                            <GroupAddon className={css.storeSuffix}>
                                .mybigcommerce.com
                            </GroupAddon>
                        </InputGroup>
                    </div>
                </div>
            </SettingsCardContent>
        </SettingsCard>
    )
}
