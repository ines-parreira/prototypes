import { AgentTimeTrackingCube } from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import { HandleTimeCubeWithJoins } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { AiSalesAgentOrderCustomersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { TicketQAScoreCubeWithJoins } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { AutomationBillingEventCubeWithJoins } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import { AIAgentAutomatedInteractionsCube } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { AutomatedTicketsCube } from 'domains/reporting/models/cubes/automate_v2/AutomatedTicketsCube'
import { AutomationDatasetCube } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetCube } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import { RecommendedResourcesCube } from 'domains/reporting/models/cubes/automate_v2/RecommendedResourcesCube'
import { WorkflowDatasetCube } from 'domains/reporting/models/cubes/automate_v2/WorkflowDatasetCube'
import { ConvertTrackingEventsCube } from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import { ConvertOrderConversionCube } from 'domains/reporting/models/cubes/ConvertOrderConversionCube'
import { ConvertOrderEventsCube } from 'domains/reporting/models/cubes/ConvertOrderEventsCube'
import { HelpCenterTrackingEventCube } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketSLACubeWithJoins } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { TicketFirstHumanAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import { VoiceCallCube } from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceCallSummaryCube } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import { VoiceEventsByAgentCube } from 'domains/reporting/models/cubes/VoiceEventsByAgent'

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
    | TicketFirstHumanAgentResponseTimeCube
