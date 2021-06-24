import {ObjectExpressionPropertyKey} from '../../state/rules/types'

export enum IdentifierCategoryKey {
    Message = 'message',
    Ticket = 'ticket',
    Customer = 'customer',
    ShopifyLastOrder = 'shopifyLastOrder',
    ShopifyCustomer = 'shopifyCustomer',
    Magento2LastOrder = 'magento2LastOrder',
    Magento2Customer = 'magento2Customer',
    RechargeLastSubscription = 'rechargeLastSubscription',
    RechargeCustomer = 'rechargeCustomer',
    SmileCustomer = 'smileCustomer',
}

export enum IdentifierCategoryValue {
    Message = 'Message',
    Ticket = 'Ticket',
    Customer = 'Customer',
    Magento2Customer = 'Magento2 Customer',
    Magento2LastOrder = 'Magento2 Last Order',
    RechargeCustomer = 'Recharge Customer',
    RechargeLastSubscription = 'Recharge Last Subscription',
    ShopifyCustomer = 'Shopify Customer',
    ShopifyLastOrder = 'Shopify Last Order',
    SmileCustomer = 'Smile Customer',
}

export enum IdentifierSubCategoryValue {
    Receiver = 'Receiver',
    Sender = 'Sender',
    Source = 'Source',
    LastFulfillment = 'Last Fulfillment',
    ShippingAddress = 'Shipping Address',
}

export enum IdentifierVariableName {
    Channel = 'channel',
    CreatedDate = 'created date',
    FromAgent = 'from agent',
    Integration = 'integration',
    Intents = 'intents',
    Public = 'public',
    ReceiverEmail = 'receiver email',
    SentDate = 'sent date',
    SenderEmail = 'sender email',
    Sentiments = 'sentiments',
    FromAddress = 'from address',
    FromName = 'from name',
    Body = 'body',
    Via = 'via',
    AssigneeTeam = 'assignee team',
    AssigneeUserEmail = 'assignee user email',
    Data = 'data',
    Email = 'email',
    DateOfLastOrder = 'date of last order',
    GrandTotal = 'grand total',
    State = 'state',
    OtherIntegrations = 'other integrations',
    Status = 'status',
    DateNextScheduledCharge = 'date of next scheduled charge',
    ProductTitle = 'product title',
    OrdersCount = 'orders count',
    Tags = 'tags',
    TotalSpent = 'total spent',
    FinancialStatus = 'financial status',
    FulfillmentStatus = 'fulfillment status',
    ShipmentStatus = 'shipment status',
    TrackingNumber = 'tracking number',
    Country = 'country',
    TotalPrice = 'total price',
    PointBalance = 'point balance',
    VipTier = 'vip tier',
    Language = 'language',
    LastMessageData = 'last message date',
    LastReceivedMessageData = 'last received message date',
    Spam = 'spam',
    Subject = 'subject',
}

export type RuleObject = {
    computed: boolean
    loc: Record<string, unknown>
    object: RuleObject | ObjectExpressionPropertyKey
    property: ObjectExpressionPropertyKey
    type: 'MemberExpression'
}

export type IdentifierElement = {
    label: string
    text: string
    value: string
}
