import {dummyAppDetail} from 'fixtures/apps'
import {PricingPlan} from 'models/integration/types/app'
import {mapAppToDetail} from '../appToDetail'

describe(`mapAppToDetail`, () => {
    it('should map data correctly', () => {
        expect(mapAppToDetail(dummyAppDetail)).toMatchInlineSnapshot(`
            {
              "alloyIntegrationId": undefined,
              "appId": "someid",
              "benefits": [
                "foo",
                "bar",
              ],
              "categories": [
                "Ecommerce",
                "Reviews & UGC",
              ],
              "company": {
                "name": "myCompany",
                "url": "https://www.gomycompany.com/",
              },
              "connectUrl": "https://ok.com",
              "description": "Some tagline here",
              "freeTrialPeriod": "14 days",
              "grantedScopes": undefined,
              "hasFreeTrial": true,
              "image": "https://ok.com/1.png",
              "infocard": {
                "pricing": {
                  "detail": "<p>They are several options:&nbsp;</p>
            <ul>
            <li>Pay once</li>
            <li>Pay on ticket</li>
            </ul>",
                  "link": "https://google.com",
                },
                "resources": {
                  "documentationLink": "",
                  "privacyPolicyLink": "https://www.mycompany.com/privacy-policy",
                },
                "support": {
                  "email": "support@gotolstoy.com",
                  "phone": "+33620033659",
                },
              },
              "isConnected": false,
              "isUnapproved": false,
              "longDescription": "<p>My company is an interactive video platform, helping users create meaningful and personal conversations at scale.</p>
            <p>With the my company app, users can sync their videos and monitor every viewer interaction, while managing leads and audience choices through easy-to-view columns.</p>
            <p>With all of your audience interactions in one place, collecting your insights is a breeze.</p>
            <p>It also has a list:</p>
            <ul>
            <li>In which noting that really matters is said but at least you see it!</li>
            <li>Isn&rsquo;t it nice?</li>
            </ul>",
              "pricingDetails": "<p>They are several options:&nbsp;</p>
            <ul>
            <li>Pay once</li>
            <li>Pay on ticket</li>
            </ul>",
              "pricingLink": "https://google.com",
              "pricingPlan": "Recurring Subscription",
              "privacyPolicy": "https://www.mycompany.com/privacy-policy",
              "screenshots": [
                "https://screen.com/my1.png",
                "https://screen.com/my2.png",
                "https://screen.com/my3.png",
                "https://screen.com/my4.png",
              ],
              "setupGuide": "",
              "supportEmail": "support@gotolstoy.com",
              "supportPhone": "+33620033659",
              "title": "My test app",
              "type": "app",
            }
        `)
    })
    it('should display correct information in pricing', () => {
        expect(
            mapAppToDetail({...dummyAppDetail, pricingPlan: PricingPlan.FREE})
                .infocard.pricing?.detail
        ).toContain('Free')

        expect(
            mapAppToDetail({...dummyAppDetail, pricingDetails: ''}).infocard
                .pricing?.detail
        ).toContain('for pricing details')
    })
})
