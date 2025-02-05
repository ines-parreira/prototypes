import {useEffect, useMemo, useState} from 'react'

import {list} from './pendingTasks/list'

export const usePendingTasks = () => {
    const [isLoading, setIsLoading] = useState(true)
    const pendingTasks = list.slice(0, 7)
    const completedTasks = list.slice(7)
    const totalTasks = list.length

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false)
        }, 2000)

        return () => clearTimeout(timeout)
    }, [])

    return useMemo(
        () => ({isLoading, pendingTasks, completedTasks, totalTasks}),
        [completedTasks, isLoading, pendingTasks, totalTasks]
    )
}
