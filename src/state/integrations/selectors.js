import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import _isArray from 'lodash/isArray'
import {getFormValues} from 'redux-form'

import {compare} from '../../utils'

export const getIntegrationsState = state => state.integrations || fromJS({})

export const getIntegrations = createSelector(
    [getIntegrationsState],
    state => state.get('integrations', fromJS([]))
)

export const getActiveIntegrations = createSelector(
    [getIntegrations],
    state => state.filter(i => !i.get('deactivated_datetime'))
)

export const getIntegrationById = id => createSelector(
    [getIntegrations],
    (integrations) => {
        return integrations.find(integration => integration.get('id') === id) || fromJS({})
    }
)

export const makeGetIntegrationById = state => id => getIntegrationById(id)(state)

export const getIntegrationsByTypes = types => createSelector(
    [getIntegrations],
    (integrations) => {
        if (!_isArray(types)) {
            types = [types]
        }

        return integrations.filter(integration => types.includes(integration.get('type')))
    }
)

export const getFacebookIntegrations = createSelector(
    [getIntegrations],
    state => state
        .filter(integration => integration.get('type') === 'facebook')
        .sort((a, b) => compare(a.getIn(['facebook', 'name']), b.getIn(['facebook', 'name'])))
)

export const getFacebookOnboardingPages = createSelector(
    [getIntegrationsState],
    state => state.getIn(['extra', 'facebook', 'onboardingPages']) || fromJS([])
)

export const getEmailIntegrations = createSelector(
    [getIntegrations],
    state => state.filter(integration => ['email', 'gmail'].includes(integration.get('type')))
)

// return email and gmail integrations formatted as channel
export const getChannels = createSelector(
    [getEmailIntegrations],
    state => state.map(integration => {
        let type = integration.get('type')

        if (integration.get('type') === 'gmail') {
            type = 'email'
        }

        return fromJS({
            id: integration.get('id'),
            type,
            name: integration.get('name'),
            address: integration.getIn(['meta', 'address']),
            preferred: integration.getIn(['meta', 'preferred']),
        })
    })
)

export const getChannelsByType = type => createSelector(
    [getChannels],
    state => state.filter(integration => integration.get('type') === type)
)

export const getAuthData = type => createSelector(
    [getIntegrationsState],
    state => state.getIn(['authentication', type], fromJS({}))
)

export const getRedirectUri = type => createSelector(
    [getAuthData(type)],
    state => state.get('redirect_uri', '')
)

export const makeGetRedirectUri = state => type => getRedirectUri(type)(state)

export const makeGetFormValues = state => form => getFormValues(form)(state)

// return the list of integration used to send messages from the helpdesk
export const getMessagingIntegrations = createSelector(
    [getIntegrationsByTypes(['email', 'gmail', 'smooch', 'smooch_inside', 'facebook'])],
    (integrations) => {
        return integrations.map((inte) => {
            if (inte.get('type') === 'facebook') {
                return inte.set('name', inte.getIn(['facebook', 'name']))
            }
            return inte
        })
    }
)

export const hasIntegrationOfTypes = types => createSelector(
    [getIntegrationsByTypes(types)],
    integrations => !integrations.isEmpty()
)

export const makeHasIntegrationOfTypes = state => types => hasIntegrationOfTypes(types)(state)
