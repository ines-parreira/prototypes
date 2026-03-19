import type { AgentTimeTrackingCube } from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import type { HandleTimeCubeWithJoins } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { AiSalesAgentOrderCustomersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import type { TicketQAScoreCubeWithJoins } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import type { AutomationBillingEventCubeWithJoins } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import type { AIAgentAutomatedInteractionsV2Cube } from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import type { AIAgentAutomatedInteractionsCube } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { AutomatedTicketsCube } from 'domains/reporting/models/cubes/automate_v2/AutomatedTicketsCube'
import type { AutomationDatasetCube } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import type { BillableTicketDatasetCube } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import type { RecommendedResourcesCube } from 'domains/reporting/models/cubes/automate_v2/RecommendedResourcesCube'
import type { SuccessRateCube } from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import type { WorkflowDatasetCube } from 'domains/reporting/models/cubes/automate_v2/WorkflowDatasetCube'
import type { ConvertTrackingEventsCube } from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import type { ConvertOrderConversionCube } from 'domains/reporting/models/cubes/ConvertOrderConversionCube'
import type { ConvertOrderEventsCube } from 'domains/reporting/models/cubes/ConvertOrderEventsCube'
import type { HelpCenterTrackingEventCube } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import type { HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import type { TicketSLACubeWithJoins } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import type { TicketFirstHumanAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import type {
    TicketInsightsTaskCube,
    TicketInsightsTaskCubeWithJoins,
} from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import type { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import type { VoiceCallCube } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { VoiceCallSummaryCube } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import type { VoiceEventsByAgentCube } from 'domains/reporting/models/cubes/VoiceEventsByAgent'

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
    | AIAgentAutomatedInteractionsV2Cube
    | SuccessRateCube
    | TicketFirstHumanAgentResponseTimeCube
    | TicketInsightsTaskCube
    | TicketInsightsTaskCubeWithJoins
