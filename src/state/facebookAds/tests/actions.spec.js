import * as actions from '../actions.ts'

describe('facebookAds actions', () => {
    describe('setFacebookAdsLoading', () => {
        it('should return SET_FACEBOOK_ADS_LOADING action', () => {
            const action = actions.setFacebookAdsLoading(true)
            expect(action).toMatchSnapshot()
        })
    })

    describe('setFacebookAdsInternals', () => {
        it('should return SET_FACEBOOK_ADS_INTERNALS action', async () => {
            const internals = {
                '1': {
                    ads: {
                        postid1: {
                            name: 'ad 1',
                            is_active: true,
                        },
                    },
                },
            }

            const action = actions.setFacebookAdsInternals(internals)
            expect(action).toMatchSnapshot()
        })
    })

    describe('addFacebookAdsLoadingAd', () => {
        it('should return ADD_LOADING_FACEBOOK_AD action', () => {
            const action = actions.addFacebookAdsLoadingAd('postid1')
            expect(action).toMatchSnapshot()
        })
    })

    describe('removeFacebookAdsLoadingAd', () => {
        it('should return REMOVE_LOADING_FACEBOOK_AD action', () => {
            const action = actions.removeFacebookAdsLoadingAd('postid1')
            expect(action).toMatchSnapshot()
        })
    })

    describe('updateFacebookAdsActiveAd', () => {
        it('should return UPDATE_ACTIVE_FACEBOOK_AD action', () => {
            const action = actions.updateFacebookAdsActiveAd(1, 'postid1', true)
            expect(action).toMatchSnapshot()
        })
    })
})
