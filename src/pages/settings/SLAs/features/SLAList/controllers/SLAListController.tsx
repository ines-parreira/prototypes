import React from 'react'
import {useUpdateSlaPolicy} from '@gorgias/api-queries'

import Loader from 'pages/settings/SLAs/features/Loader/Loader'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'

import LandingPage from '../../LandingPage/LandingPage'
import SLAListView from '../views/SLAListView'

import useGetSLAPolicies from './useGetSLAPolicies'

export default function SLAListController() {
    const dispatch = useAppDispatch()
    const {data, isLoading, refetch: refetchSLAPolicies} = useGetSLAPolicies()

    const SLAPolicies = data || []

    const hasSLAs = SLAPolicies && SLAPolicies?.length > 0

    const {mutateAsync: updateSLA, isLoading: isSubmitting} =
        useUpdateSlaPolicy()

    const togglePolicy = (id: string, active: boolean) => {
        void (async function () {
            try {
                await updateSLA({id, data: {active: active}})

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `SLA policy toggled`,
                    })
                )
                void refetchSLAPolicies()
            } catch (e) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Failed to toggle SLA policy`,
                    })
                )
            }
        })()
    }

    const changePolicyPriority = (id: string, priority: number) => {
        void (async function () {
            try {
                await updateSLA({id, data: {priority: String(priority)}})
                void refetchSLAPolicies()
            } catch (e) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Failed to change SLA policy priority`,
                    })
                )
            }
        })()
    }

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : hasSLAs ? (
                <SLAListView
                    data={SLAPolicies}
                    onTogglePolicy={togglePolicy}
                    onPolicyPriorityChange={changePolicyPriority}
                    isSubmitting={isSubmitting}
                />
            ) : (
                <LandingPage />
            )}
        </>
    )
}
