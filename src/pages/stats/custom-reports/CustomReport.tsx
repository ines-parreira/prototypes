import React from 'react'
import {useParams} from 'react-router-dom'

export const CUSTOM_REPORT_TITLE = 'CUSTOM REPORT ID:'

export const CustomReport = () => {
    const {id} = useParams<{id: string}>()

    return (
        <div className="full-width">
            <div>
                {CUSTOM_REPORT_TITLE} {id}
            </div>
        </div>
    )
}
