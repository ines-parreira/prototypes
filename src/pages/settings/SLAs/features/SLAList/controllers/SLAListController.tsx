import React from 'react'

import LandingPage from '../../LandingPage/LandingPage'
import SLAListView from '../views/SLAListView'
import Loader from '../views/Loader'

import useGetSLAPolicies from './useGetSLAPolicies'

export default function SLAListController() {
    const {data, isLoading} = useGetSLAPolicies()

    const SLAPolicies = data || []

    const hasSLAs = SLAPolicies && SLAPolicies?.length > 0

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : hasSLAs ? (
                <SLAListView data={SLAPolicies} />
            ) : (
                <LandingPage />
            )}
        </>
    )
}
