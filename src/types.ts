/**
 * 본 타입 정의는 `final/02. 기능정의서-Admin.md` § 2.1 데이터 구조를 따른다.
 * 사용자 화면(`02-1. 와이어프레임-Admin.md`)에서 라벨로만 노출되는 객체
 * (이의 제기·결정 재확인·릴리즈 완료)는 노출 식별자를 표시하지 않는다.
 */

export enum ReviewStatus {
  REQUESTED = '요청',
  UNDER_REVIEW = '검토중',
  REJECTED = '반려',
  APPROVED = '승인',
  COMPLETED = '완료',
  CANCELLED = '취소',
  PENDING_RECONFIRMATION = '재확인 대기',
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum AIResultLabel {
  AUTO_REJECTED = '자동 반려',
  HUMAN_REVIEW_REQUIRED = '사람 최종 판단 필요',
  EXPRESSION_FIX = '표현·고지 보완',
  GREY_AREA = '위반 가능성',
  DELAYED = 'AI 지연',
}

export type ReviewerLabel = '표현·고지 보완' | '위반 가능성';

export type CitationSource = '정책' | '내부가이드' | '선례';

export interface Violation {
  text: string;
  category: string;
  severity: RiskLevel;
  reason: string;
  citationDocumentIds?: string[];
}

export interface Citation {
  type: CitationSource;
  documentId: string;
  title: string;
  version: string;
  effectiveDate?: Date;
  confidence: number;
  reason: string;
  excerpt?: string;
  deprecated?: boolean;
}

export interface SelfCheckFinding {
  text: string;
  severity: RiskLevel;
  category: string;
  suggestion: string;
  ignored?: boolean;
  ignoreReason?: string;
}

export interface VersionEntry {
  version: number;
  adCopy: string;
  diff?: { added: string[]; removed: string[] };
  createdAt: Date;
  authorName: string;
  note?: string;
}

export interface AssigneeDecision {
  domain: 'compliance' | 'legal';
  assigneeName: string;
  outcome?: 'approve' | 'reject' | 'cancel';
  memo?: string;
  decidedAt?: Date;
  policyVersionIds?: string[];
}

export interface AuditEntry {
  reviewId: string;
  requestId: string;
  approverName: string;
  approverDepartment: string;
  decision: ReviewStatus;
  decidedAt: Date;
  policyVersions: { documentId: string; version: string }[];
  precedentIds: string[];
  copyBefore: string;
  copyAfter: string;
  memo: string;
}

export interface PostReleaseCheck {
  exposureUrl: string;
  screenshotUrl: string;
  verifiedAt: Date;
  verifiedBy: string;
}

export interface ReviewRequest {
  id: string;
  parentRequestId?: string | null;
  chainLength?: number;
  applicantId: string;
  applicantName: string;
  department: string;
  campaignName: string;
  materialType: string;
  channels: string[];
  exposurePeriod: { start: Date; end: Date };
  targetAudience: string;
  urgency: '일반' | '긴급';
  description: string;
  adCopy: string;
  imageUrl?: string;
  ocrText?: string;
  landingUrl?: string;
  status: ReviewStatus;
  aiResult?: {
    label: AIResultLabel;
    riskLevel: RiskLevel;
    riskScore?: number;
    violations: Violation[];
    citations: Citation[];
    suggestedRevision?: string;
    confidence: number;
    requiredTracks?: ('compliance' | 'legal')[];
    notifiedAt?: Date;
  };
  reviewerLabel?: ReviewerLabel;
  selfCheck?: SelfCheckFinding[];
  versions: VersionEntry[];
  audit: AuditEntry[];
  assigneeName?: string;
  assigneeDepartment?: string;
  assignees?: AssigneeDecision[];
  postRelease?: PostReleaseCheck | null;
  policyDeprecatedWarning?: { documentId: string; reason: string };
  slaDueAt?: Date;
  appealReason?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Policy {
  id: string;
  title: string;
  version: string;
  category: '정책·법령' | '내부 가이드';
  description: string;
  effectiveDate: Date;
  expiryDate?: Date;
  status: '인용 가능' | '인용 중지' | '폐기';
  impactScope: string;
  changeReason: string;
  ownerDepartment: string;
  createdBy: string;
  createdAt: Date;
}

export interface PolicyProposal {
  id: string;
  policyId?: string;
  category: '정책·법령' | '내부 가이드';
  documentId: string;
  documentName: string;
  newVersion: string;
  effectiveFrom: Date;
  valueBefore?: string;
  valueAfter: string;
  changeReason: string;
  proposedBy: string;
  proposedAt: Date;
  affectedReviewIds: string[];
  status: '승인 대기' | '승인 완료' | '반려';
}
