import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {baseHttp, httpIntegration} from 'fixtures/integrations'
import {ContentType} from 'models/api/types'
import {Integration} from 'pages/integrations/integration/components/http/Integration/Integration'
import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'

describe('Integration', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: undefined,
        isUpdate: false,
        loading: {},
        deactivateIntegration: jest.fn(),
        activateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
    }
    it('should display default values because there is no integration (creation)', () => {
        const {container} = render(<Integration {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display minimal information because integration is incomplete', () => {
        const {container} = render(
            <Integration
                {...minProps}
                integration={{
                    ...httpIntegration,
                    http: null,
                }}
                isUpdate
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display data about the integration', () => {
        const {container} = render(
            <Integration
                {...minProps}
                integration={httpIntegration}
                isUpdate={true}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display loading state because the integration is loading', () => {
        const {container} = render(
            <Integration {...minProps} isUpdate={true} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display data with url-encoded format', () => {
        const {container} = render(
            <Integration
                {...minProps}
                integration={{
                    ...httpIntegration,
                    http: {
                        ...baseHttp,
                        request_content_type: ContentType.Form,
                    },
                }}
                isUpdate={true}
                loading={fromJS({integration: false})}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display confirmation message before the deletion and message should not contain text about "saved filters"', () => {
        const {getByText, queryByText} = render(
            <Integration
                {...minProps}
                integration={httpIntegration}
                isUpdate={true}
            />
        )

        fireEvent.click(screen.getByText(/Delete HTTP integration/i))

        expect(
            getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
        ).toBeInTheDocument()
        expect(
            queryByText(INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT)
        ).not.toBeInTheDocument()
    })

    it('should display confirmation message before the deletion and message should contain text about "saved filters" when FF is enabled', () => {
        const {getByText} = render(
            <Integration
                {...{
                    ...minProps,
                    flags: {[FeatureFlagKey.AnalyticsSavedFilters]: true},
                }}
                integration={httpIntegration}
                isUpdate={true}
            />
        )

        fireEvent.click(screen.getByText(/Delete HTTP integration/i))

        expect(
            getByText(
                `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT}`
            )
        ).toBeInTheDocument()
    })
})
