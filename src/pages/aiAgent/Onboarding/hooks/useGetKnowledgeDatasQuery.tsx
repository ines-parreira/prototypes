import { useQuery } from '@tanstack/react-query'

import {
    mockedAverageOrders,
    mockedCategories,
    mockedLocations,
    mockedProducts,
} from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import { TopElement } from 'pages/aiAgent/Onboarding/components/TopElementsCard/types'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'
import { TwoDimensionalDataItem } from 'pages/stats/types'

type QueryData = {
    locations: TopElement[]
    products: Product[]
    averageOrders: TwoDimensionalDataItem[]
    experienceScore: number
    categories: TopElement[]
    averageDiscount: number
    repeatRate: number
}

const fetchFakedData = async (): Promise<QueryData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                locations: mockedLocations,
                products: mockedProducts,
                experienceScore: 50,
                categories: mockedCategories,
                averageDiscount: 10,
                averageOrders: mockedAverageOrders,
                repeatRate: 2,
            })
        }, 2000)
    })
}

export const useGetKnowledgeDatasQuery = () =>
    useQuery(['fakedData'], fetchFakedData, {
        staleTime: Infinity, // Keep the data fresh indefinitely (faked data)
    })
