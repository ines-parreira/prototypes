import {ulid} from 'ulidx'
import {assetsUrl} from 'utils'
import {
    CampaignConfiguration,
    CampaignTemplate,
} from 'pages/convert/campaigns/templates/types'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignConfigurationBuilder} from 'pages/convert/campaigns/templates/constructor'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'

export const CSM_SUGGEST_COMPLIMENTARY_PRODUCT_TO_PREVIOUS_PURCHASE: CampaignTemplate =
    {
        slug: 'csm-suggest-complimentary-product-to-previous-purchase',
        name: '[Target Return Customers] Suggest Complimentary product to previous purchase',
        onboarding: false,
        preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
        getConfiguration: (): Promise<CampaignConfiguration> => {
            const triggers = [
                {
                    id: ulid(),
                    type: CampaignTriggerType.IncognitoVisitor,
                    operator: CampaignTriggerOperator.Eq,
                    value: 'false',
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.SessionTime,
                    operator: CampaignTriggerOperator.Gt,
                    value: 10,
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.CurrentUrl,
                    operator: CampaignTriggerOperator.Contains,
                    value: ['/collections'],
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.OrderedProducts,
                    operator: CampaignTriggerOperator.NotContains,
                    value: [],
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.CurrentUrl,
                    operator: CampaignTriggerOperator.Contains,
                    value: ['/'],
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.BusinessHours,
                    operator: CampaignTriggerOperator.Eq,
                    value: 'anytime',
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.OrderedProducts,
                    operator: CampaignTriggerOperator.ContainsAny,
                    value: [],
                },
            ]

            const builder = new CampaignConfigurationBuilder(
                CSM_SUGGEST_COMPLIMENTARY_PRODUCT_TO_PREVIOUS_PURCHASE,
                {
                    name: CSM_SUGGEST_COMPLIMENTARY_PRODUCT_TO_PREVIOUS_PURCHASE.name,
                    template_id:
                        CSM_SUGGEST_COMPLIMENTARY_PRODUCT_TO_PREVIOUS_PURCHASE.slug,
                    message_text: `Hope you're loving the Model x surfboard!

We just launced a new set of fins that team USA is using in their model x at the Olympics. 

Since you missed out on the bundle to save option, use code SECOND CHANCE for 5% off today.
`,
                    message_html: `<div>Hope you&#x27;re loving the Model x surfboard!</div><div><br></div><div>We just launced a <strong>new set of fins</strong> that team USA is using in their model x at the Olympics. </div><div><br></div><div>Since you missed out on the bundle to save option, use code SECOND CHANCE for 5% off today.</div><div><br></div>`,
                    status: CampaignStatus.Inactive,
                    triggers: triggers,
                    trigger_rule: createTriggerRule(triggers),
                    attachments: [],
                }
            )

            return Promise.resolve(builder.build())
        },
    }
