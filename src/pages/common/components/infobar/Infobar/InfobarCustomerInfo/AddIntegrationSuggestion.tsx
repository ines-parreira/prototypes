import React from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

export default function AddIntegrationSuggestion() {
    return (
        <div className="no-result-container mt-5">
            <div
                className="mb-3"
                style={{
                    margin: '0 18px',
                    fontSize: '20px',
                    fontWeight: 600,
                }}
            >
                Display customer data here by adding an integration
            </div>
            <Link to="/app/settings/integrations">
                <Button
                    type="button"
                    onClick={() => {
                        logEvent(SegmentEvent.InfobarIntegrationAddClicked)
                    }}
                >
                    Add integration
                </Button>
            </Link>
        </div>
    )
}
