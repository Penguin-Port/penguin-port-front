export type RecommendationSourceTone = 'openai' | 'fallback' | 'seed' | 'demo' | 'unknown'

export interface RecommendationSourceMeta {
  label: string
  tone: RecommendationSourceTone
}

export function getRecommendationSourceMeta(source?: string): RecommendationSourceMeta {
  switch (source?.toUpperCase()) {
    case 'OPENAI':
      return { label: 'OPENAI 생성', tone: 'openai' }
    case 'RULE_FALLBACK':
      return { label: '규칙 기반', tone: 'fallback' }
    case 'MVP_SEED':
      return { label: '시드 데이터', tone: 'seed' }
    case 'DEMO':
      return { label: '데모 데이터', tone: 'demo' }
    default:
      return { label: '출처 미확인', tone: 'unknown' }
  }
}
