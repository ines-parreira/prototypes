import React, {useCallback, useState} from 'react'

import client from 'models/api/resources'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {ConfirmationModal} from '../helpCenter/components/ConfirmationModal'

type Props = {
    id: string
    name: string
    logo: any

    value: boolean
    loading: boolean
    disabled: boolean

    setValue: (val: boolean) => Promise<void>
}

export const SsoToggleButton = (props: Props) => {
    const {id, name, logo, value, loading, disabled, setValue} = props

    const [ssoModalVisible, setSsoModalVisible] = useState(false)
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [userCount, setUserCount] = useState<number>()

    const loadUsers = useCallback(async () => {
        setIsLoadingUsers(true)
        const resp = await client.get<Record<string, number>>('/api/sso/users')
        const count = resp.data[id] || 0
        setIsLoadingUsers(false)
        return count
    }, [id])

    const handleToggle = useCallback(
        async (val: boolean) => {
            // When disabling SSO, first check if there would be impacted users
            if (!val) {
                const count = await loadUsers()
                if (count > 0) {
                    setUserCount(count)
                    setSsoModalVisible(true)
                    return
                }
            }
            return setValue(val)
        },
        [loadUsers, setValue]
    )

    return (
        <>
            <div className="mb-2 d-flex align-items-center">
                <ToggleInput
                    isToggled={value}
                    isLoading={loading || isLoadingUsers || ssoModalVisible}
                    isDisabled={disabled}
                    onClick={handleToggle}
                />
                <img
                    alt={name + ' logo'}
                    src={logo}
                    className="ml-3 mr-2"
                    style={{height: '1.4em'}}
                />
                <b>Enable {name} Single Sign-On</b>
            </div>

            <ConfirmationModal
                isOpen={ssoModalVisible}
                title={`Deactivate ${name} Single Sign-On?`}
                confirmText="Deactivate"
                onConfirm={() => {
                    void setValue(false)
                    setSsoModalVisible(false)
                }}
                onClose={() => setSsoModalVisible(false)}
            >
                <b>{userCount} users</b> are going to be impacted by this.
                They'll need to create a password to access their account.
            </ConfirmationModal>
        </>
    )
}

export default SsoToggleButton
