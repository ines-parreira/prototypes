import { useCallback, useEffect, useState } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { FocusActivationModal } from '../utils'

export const useActivationModalDisclosure = () => {
    const location = useLocation()
    const history = useHistory()
    const [isModalVisible, setIsModalVisible] = useState(
        location.search.includes(FocusActivationModal.searchParam),
    )

    const closeModal = useCallback(() => {
        setIsModalVisible(false)
        // Remove the focusActivationModal search param from the current url
        const searchParams = new URLSearchParams(location.search)
        searchParams.delete(FocusActivationModal.searchParam)
        history.push(`${location.pathname}?${searchParams.toString()}`)
    }, [history, location.search, location.pathname])

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        if (searchParams.has(FocusActivationModal.searchParam)) {
            setIsModalVisible(true)
        }
    }, [location.search, setIsModalVisible])

    return { isModalVisible, setIsModalVisible, closeModal }
}
