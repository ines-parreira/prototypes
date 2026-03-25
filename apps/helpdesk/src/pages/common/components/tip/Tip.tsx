import type React from 'react'
import { useState } from 'react'

import { tryLocalStorage } from '@repo/browser-storage'

import useAppSelector from 'hooks/useAppSelector'
import type { Props as LinkAlertProps } from 'pages/common/components/Alert/LinkAlert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import { getCurrentUser } from 'state/currentUser/selectors'

type Props = {
    storageKey: string
} & LinkAlertProps

const Tip: React.FC<Props> = ({ storageKey, children, ...linkAlertProps }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentUserId = currentUser.get('id') as number
    const tipStorageKey = `user:${currentUserId}:tip:${storageKey}`

    let initialValue = true
    tryLocalStorage(() => {
        initialValue = !window.localStorage.getItem(tipStorageKey)
    })

    const [show, setShow] = useState(initialValue)

    if (!show) return null

    const hide = () => {
        setShow(false)
        tryLocalStorage(() => {
            window.localStorage.setItem(tipStorageKey, '1')
        })
    }

    return (
        <LinkAlert onAction={hide} {...linkAlertProps}>
            {children}
        </LinkAlert>
    )
}

export default Tip
