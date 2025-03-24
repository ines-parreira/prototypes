import { useEffect, useState } from 'react'

import { useHistory, useLocation, useParams } from 'react-router-dom'

import { FocusActivationModal } from '../utils'

export const useActivationModalDisclosure = () => {
    const location = useLocation()
    const history = useHistory()
    const [isModalVisible, setIsModalVisible] = useState(
        location.search.includes(FocusActivationModal.searchParam),
    )
    const params = useParams<{ shopName?: string }>()
    const shopName =
        FocusActivationModal.extractStoreName(location) ?? params.shopName

    const closeModal = () => {
        setIsModalVisible(false)
        // Remove the focusActivationModal search param from the current url
        const searchParams = new URLSearchParams(location.search)
        searchParams.delete(FocusActivationModal.searchParam)
        history.push(`${location.pathname}?${searchParams.toString()}`)
    }

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        if (searchParams.has(FocusActivationModal.searchParam)) {
            setIsModalVisible(true)
        }
    }, [location.search, setIsModalVisible])

    return { isModalVisible, setIsModalVisible, closeModal, shopName }
}
