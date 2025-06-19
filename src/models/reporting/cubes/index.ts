import { AgentTimeTrackingCube } from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import { HandleTimeCubeWithJoins } from 'models/reporting/cubes/agentxp/HandleTimeCube'
import { AiSalesAgentConversationsCube } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersCube } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { AiSalesAgentOrderCustomersCube } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { TicketQAScoreCubeWithJoins } from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import { AutomationBillingEventCubeWithJoins } from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import { AIAgentAutomatedInteractionsCube } from 'models/reporting/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { AutomatedTicketsCube } from 'models/reporting/cubes/automate_v2/AutomatedTicketsCube'
import { AutomationDatasetCube } from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetCube } from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import { RecommendedResourcesCube } from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import { WorkflowDatasetCube } from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import { ConvertTrackingEventsCube } from 'models/reporting/cubes/convert/ConvertTrackingEventsCube'
import { ConvertOrderConversionCube } from 'models/reporting/cubes/ConvertOrderConversionCube'
import { ConvertOrderEventsCube } from 'models/reporting/cubes/ConvertOrderEventsCube'
import { HelpCenterTrackingEventCube } from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import { HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins } from 'models/reporting/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketSLACubeWithJoins } from 'models/reporting/cubes/sla/TicketSLACube'
import { TicketTagsEnrichedCube } from 'models/reporting/cubes/TicketTagsEnrichedCube'
import { VoiceCallCube } from 'models/reporting/cubes/VoiceCallCube'
import { VoiceCallSummaryCube } from 'models/reporting/cubes/VoiceCallSummaryCube'
import { VoiceEventsByAgentCube } from 'models/reporting/cubes/VoiceEventsByAgent'

export type Cubes =
    | AgentTimeTrackingCube
    | AutomationBillingEventCubeWithJoins
    | AutomationDatasetCube
    | AutomatedTicketsCube
    | BillableTicketDatasetCube
    | ConvertOrderEventsCube
    | ConvertOrderConversionCube
    | HandleTimeCubeWithJoins
    | HelpCenterTrackingEventCube
    | HelpdeskMessageCubeWithJoins
    | HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins
    | TicketQAScoreCubeWithJoins
    | TicketSLACubeWithJoins
    | VoiceCallCube
    | VoiceCallSummaryCube
    | VoiceEventsByAgentCube
    | WorkflowDatasetCube
    | TicketTagsEnrichedCube
    | RecommendedResourcesCube
    | AiSalesAgentConversationsCube
    | AiSalesAgentOrdersCube
    | AiSalesAgentOrderCustomersCube
    | ConvertTrackingEventsCube
    | AIAgentAutomatedInteractionsCube
