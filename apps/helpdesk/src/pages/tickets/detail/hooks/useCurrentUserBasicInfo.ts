import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'

type CurrentUserBasicInfo = {
    name: string
    firstname: string
    lastname: string
    email: string
}

export const useCurrentUserBasicInfo = (): CurrentUserBasicInfo => {
    const currentUser = useAppSelector(getCurrentUser)

    return useMemo(
        () => ({
            name: currentUser.get('name') as string,
            firstname: currentUser.get('firstname') as string,
            lastname: currentUser.get('lastname') as string,
            email: currentUser.get('email') as string,
        }),
        [currentUser],
    )
}
