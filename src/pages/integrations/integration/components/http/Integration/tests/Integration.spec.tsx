import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'

import {baseHttp, httpIntegration} from 'fixtures/integrations'

import {ContentType} from 'models/api/types'

import {Integration} from '../Integration'

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
})
