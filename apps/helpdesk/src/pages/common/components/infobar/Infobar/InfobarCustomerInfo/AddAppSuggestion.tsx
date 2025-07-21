import { Link } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import Button from 'pages/common/components/button/Button'

export default function AddAppSuggestion() {
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
                Display customer data here by adding an app
            </div>
            <Link to="/app/settings/integrations">
                <Button
                    type="button"
                    onClick={() => {
                        logEvent(SegmentEvent.InfobarIntegrationAddClicked)
                    }}
                >
                    Add app
                </Button>
            </Link>
        </div>
    )
}
