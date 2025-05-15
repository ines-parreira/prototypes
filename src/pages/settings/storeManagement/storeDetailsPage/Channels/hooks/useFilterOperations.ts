import { useState } from 'react'

export const useFilterOperations = (
    setAssignedChannelIds: React.Dispatch<React.SetStateAction<number[]>>,
) => {
    const [selectedFilterItems, setSelectedFilterItems] = useState<number[]>([])

    const updateSelectedIntegrations = (selectedIds: number[]) => {
        setSelectedFilterItems(selectedIds)
    }

    const handleFilterClose = () => {
        setAssignedChannelIds((prev) => [...prev, ...selectedFilterItems])
        setSelectedFilterItems([])
    }

    return {
        selectedFilterItems,
        updateSelectedIntegrations,
        handleFilterClose,
    }
}
