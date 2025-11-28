import { apiGet } from '@/lib/utils';

// 根据 consideration_ids 获取卡片内容
export async function getConsiderationsByIds(considerationIds: string): Promise<Array<{
  id: number;
  content: string;
  classification: string;
  content_html: string;
  }>> {
  try {
    const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
    const resp = await apiGet<{ items: any[] }>(`/api/db/considerations`, { ids: considerationIds, lang });
    if (Array.isArray(resp?.items)) return resp.items as any[];
    return [];
  } catch (error) {
    console.error('Failed to get considerations:', error);
    return [];
  }
}

// 根据国家和行业获取 consideration_ids
export async function getConsiderationIdsByCountryAndIndustry(
  countryName: string, 
  industryName: string
): Promise<string> {
  try {
    const resp = await apiGet<{ ids: string[] }>(`/api/db/consideration-ids`, { countryName, industryName });
    if (Array.isArray(resp?.ids)) return (resp.ids || []).join(',');
    return '';
  } catch (error) {
    console.error('Failed to get consideration IDs:', error);
    return '';
  }
}

// 根据国家和行业获取 initiative_ids
export async function getInitiativeIdsByCountryAndIndustry(
  countryName: string,
  industryName: string
): Promise<string[]> {
  try {
    const resp = await apiGet<{ ids: string[] }>(`/api/db/initiative-ids`, { countryName, industryName });
    if (Array.isArray(resp?.ids)) return resp.ids;
    return [];
  } catch (error) {
    console.error('Failed to get initiative IDs:', error);
    return [];
  }
}

// 根据 initiative_ids 获取具体的 initiatives 数据
export async function getInitiativesByIds(ids: string[]): Promise<Array<{
  id: number;
  name: string;
  intro: string;
  logo: string;
  link: string;
  classification: string;
  intro_html: string;
  }>> {
  try {
    if (ids.length === 0) {
      return [];
    }
    const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
    const resp = await apiGet<{ items: any[] }>(`/api/db/initiatives`, { ids: ids.join(','), lang });
    if (Array.isArray(resp?.items)) return resp.items as any[];
    return [];
  } catch (error) {
    console.error('Failed to get initiatives:', error);
    return [];
  }
}

// 根据的和行业获取 organization_ids
export async function getOrganizationIdsByCountryAndIndustry(
  countryName: string,
  industryName: string
): Promise<string[]> {
  try {
    const resp = await apiGet<{ ids: string[] }>(`/api/db/organization-ids`, { countryName, industryName });
    if (Array.isArray(resp?.ids)) return resp.ids;
    return [];
  } catch (error) {
    console.error('Error fetching organization IDs:', error);
    return [];
  }
}

// 根据 ID 列表获取 organizations 数据
export async function getOrganizationsByIds(ids: string[]): Promise<Array<{
  id: number;
  name: string;
  intro: string;
  logo: string;
  link: string;
  classification: string;
  intro_html: string;
  }>> {
  try {
    if (ids.length === 0) return [];
    const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
    const resp = await apiGet<{ items: any[] }>(`/api/db/organizations`, { ids: ids.join(','), lang });
    if (Array.isArray(resp?.items)) return resp.items as any[];
    return [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

// 清理数据库连接
export function closeDatabase() {
  return;
}

// 根据国家和行业获取 risk_ids
export async function getRiskIdsByCountryAndIndustry(
  countryName: string,
  industryName: string
): Promise<string[]> {
  try {
    const resp = await apiGet<{ ids: string[] }>(`/api/db/risk-ids`, { countryName, industryName });
    if (Array.isArray(resp?.ids)) return resp.ids;
    return [];
  } catch (error) {
    console.error('Failed to get risk IDs:', error);
    return [];
  }
}

// 根据 risk_ids 获取风险数据
export async function getRisksByIds(ids: string[]): Promise<Array<{
  id: number;
  issue_id: number;
  sub_issue_id: number;
  content: string;
  classification: string;
  source: string;
  content_html: string;
  issue_name?: string;
  sub_issue_name?: string;
  }>> {
  try {
    if (ids.length === 0) return [];
    const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
    const resp = await apiGet<{ items: any[] }>(`/api/db/risks`, { ids: ids.join(','), lang });
    if (Array.isArray(resp?.items)) return resp.items as any[];
    return [];
  } catch (error) {
    console.error('Failed to get risks:', error);
    return [];
  }
}

// 根据国家和行业获取 advice_ids
export async function getAdviceIdsByCountryAndIndustry(
  countryName: string,
  industryName: string
): Promise<string[]> {
  try {
    const resp = await apiGet<{ ids: string[] }>(`/api/db/advice-ids`, { countryName, industryName });
    if (Array.isArray(resp?.ids)) return resp.ids;
    return [];
  } catch (error) {
    console.error('Failed to get advice IDs:', error);
    return [];
  }
}

// 根据 advice_ids 获取建议数据
export async function getAdviceByIds(ids: string[]): Promise<Array<{
  id: number;
  issue_id: number;
  sub_issue_id: number;
  content: string;
  classification: string;
  source: string;
  content_html: string;
  issue_name?: string;
  sub_issue_name?: string;
  }>> {
  try {
    if (ids.length === 0) return [];
    const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
    const resp = await apiGet<{ items: any[] }>(`/api/db/advice`, { ids: ids.join(','), lang });
    if (Array.isArray(resp?.items)) return resp.items as any[];
    return [];
  } catch (error) {
    console.error('Failed to get advice:', error);
    return [];
  }
}

export async function warmupDatabases(): Promise<void> {
  try { await apiGet('/api/health'); } catch {}
}

export async function prefetchAllDatabases(): Promise<void> {
  try { await apiGet('/api/health'); } catch {}
}
