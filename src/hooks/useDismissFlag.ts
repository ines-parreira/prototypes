import {useCallback, useMemo, useState} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useLocalStorage} from 'react-use'

export function useDismissFlag(key: string, defaultVisible = false) {
    const [visible, setVisible] = useState(defaultVisible)
    const [isHiddenPermanently, setIsHiddenPermanently] =
        useLocalStorage<boolean>(key, false)

    const handleOnDismiss = useCallback(() => {
        setIsHiddenPermanently(true)
        setVisible(false)
    }, [setIsHiddenPermanently])

    const api = useMemo(
        () => ({
            isDismissed: isHiddenPermanently || !visible,
            dismiss: handleOnDismiss,
        }),
        [handleOnDismiss, isHiddenPermanently, visible]
    )

    return api
}
