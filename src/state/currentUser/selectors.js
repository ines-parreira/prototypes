import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {getViews} from '../views/selectors'

export const getCurrentUserState = state => state.currentUser || fromJS({})

export const getSettings = createSelector(
    [getCurrentUserState],
    state => state.get('settings', fromJS([]))
)

export const getSettingsByType = type => createSelector(
    [getViews, getSettings],
    (views, settings) => {
        settings = settings.find(setting => setting.get('type') === type, null, fromJS({type, data: {}}))

        // update settings according to views configuration
        views.forEach((view) => {
            const viewId = view.get('id')
            const viewSetting = settings.getIn(['data', viewId.toString()], fromJS({}))

            const hide = viewSetting.get('hide', false)
            const displayOrder = viewSetting.get('display_order', view.get('display_order', 0))

            settings = settings
                .setIn(['data', viewId.toString(), 'hide'], hide)
                .setIn(['data', viewId.toString(), 'display_order'], displayOrder)
        })

        return settings
    }
)
