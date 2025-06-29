export interface Asset {
  id: string;
  name: string;
  category: 'financial' | 'property' | 'digital' | 'personal' | 'legal';
  type: string;
  value: string;
  location: string;
  instructions: string;
  beneficiaries: string[];
  dateAdded: string;
  lastUpdated: string;
  releaseConditions?: ReleaseCondition[];
  accessInstructions?: AccessInstruction[];
  knowledgeVerification?: KnowledgeVerification;
}

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  isPrimaryBeneficiary: boolean;
  dateAdded: string;
  emergencyContact?: boolean;
  verificationMethod?: 'email' | 'phone' | 'legal' | 'biometric';
}

export interface Document {
  id: string;
  name: string;
  category: 'legal' | 'financial' | 'insurance' | 'personal' | 'medical';
  type: string;
  size: string;
  location: string;
  description: string;
  dateAdded: string;
  lastUpdated: string;
  accessLevel?: 'immediate' | 'conditional' | 'restricted';
  releaseConditions?: ReleaseCondition[];
}

export interface ReleaseCondition {
  id: string;
  type: 'time_delay' | 'death_certificate' | 'legal_verification' | 'multi_party_approval' | 'specific_date' | 'age_requirement' | 'knowledge_verification';
  description: string;
  parameters: {
    delayDays?: number;
    requiredApprovers?: string[];
    minimumApprovals?: number;
    specificDate?: string;
    requiredAge?: number;
    legalDocumentRequired?: boolean;
    knowledgeTestId?: string;
    passingScore?: number;
    maxAttempts?: number;
  };
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdDate: string;
}

export interface AccessInstruction {
  id: string;
  step: number;
  title: string;
  description: string;
  requiredDocuments?: string[];
  contactInfo?: string;
  estimatedTime?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface InheritanceEvent {
  id: string;
  type: 'asset_release' | 'document_access' | 'notification_sent' | 'verification_required' | 'knowledge_test_required';
  assetId?: string;
  documentId?: string;
  beneficiaryId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  triggeredDate: string;
  completedDate?: string;
  notes?: string;
  knowledgeTestResult?: KnowledgeTestResult;
}

export interface NotificationRule {
  id: string;
  name: string;
  trigger: 'immediate' | 'time_based' | 'condition_met' | 'manual';
  recipients: string[];
  message: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastSent?: string;
}

// New Knowledge Verification Types
export interface KnowledgeVerification {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number; // in minutes
  categories: KnowledgeCategory[];
  flashcards: Flashcard[];
  avatarIntroVideoId?: string;
  avatarSuccessVideoId?: string;
  avatarFailureVideoId?: string;
  createdDate: string;
  lastUpdated: string;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage of total score
  color: string;
  icon: string;
}

export interface Flashcard {
  id: string;
  categoryId: string;
  question: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'scenario';
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  tags: string[];
  parentalWisdom?: string; // Special message from parent
  culturalContext?: string; // Cultural significance
  lifeLesson?: string; // What this teaches about life
  avatarVideoId?: string; // Custom avatar explanation
}

export interface KnowledgeTestResult {
  id: string;
  testId: string;
  beneficiaryId: string;
  assetId: string;
  attemptNumber: number;
  startTime: string;
  endTime?: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  answers: TestAnswer[];
  categoryScores: CategoryScore[];
  timeSpent: number; // in seconds
  status: 'in_progress' | 'completed' | 'abandoned';
  feedback?: string;
  nextAttemptAllowed?: string;
}

export interface TestAnswer {
  flashcardId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
  attempts: number;
}

export interface CategoryScore {
  categoryId: string;
  score: number;
  totalPoints: number;
  percentage: number;
}

export interface LifeMilestone {
  id: string;
  title: string;
  description: string;
  category: 'education' | 'career' | 'personal' | 'family' | 'financial' | 'spiritual' | 'cultural';
  requiredAge?: number;
  verificationMethod: 'self_declaration' | 'document_upload' | 'third_party_verification';
  isCompleted: boolean;
  completedDate?: string;
  evidence?: string[];
  parentalMessage?: string;
}