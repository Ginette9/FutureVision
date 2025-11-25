import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import enDbUrl from '@/data/csr_database.db?url';
import cnDbUrl from '@/data/csr_database_CN.db?url';
import hkDbUrl from '@/data/csr_database_HK.db?url';
import { apiGet } from '@/lib/utils';

// 缓存 SQL.js 和两个数据库实例（英文库用于ID映射，本地化库用于内容）
let SQLLib: any = null;
let dbEnglish: any = null;
let dbLocalized: any = null;
let dbLocalizedLang: 'en-US' | 'zh-CN' | 'zh-HK' | null = null;

async function loadSQL() {
  if (SQLLib) return SQLLib;
  SQLLib = await initSqlJs({ locateFile: () => sqlWasmUrl });
  return SQLLib;
}

// 英文库（用于 applicability_grouped 的 ID 映射）
async function initDatabaseEnglish() {
  if (dbEnglish) return dbEnglish;
  try {
    const SQL = await loadSQL();
    const res = await fetch(enDbUrl);
    const uint8 = new Uint8Array(await res.arrayBuffer());
    dbEnglish = new SQL.Database(uint8);
    return dbEnglish;
  } catch (error) {
    console.error('Failed to initialize English database:', error);
    throw error;
  }
}

// 本地化库（中文或英文，用于根据 ID 获取内容）
async function initDatabaseLocalized() {
  try {
    const SQL = await loadSQL();
    const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';

    // 若已初始化但语言不同，重新加载对应语言的数据库
    if (dbLocalized && dbLocalizedLang === lang) {
      return dbLocalized;
    }
    if (dbLocalized && dbLocalizedLang !== lang) {
      try { if (typeof dbLocalized.close === 'function') dbLocalized.close(); } catch {}
      dbLocalized = null;
    }

    const url = lang === 'zh-CN' ? cnDbUrl : (lang === 'zh-HK' ? hkDbUrl : enDbUrl);
    const res = await fetch(url);
    const uint8 = new Uint8Array(await res.arrayBuffer());
    dbLocalized = new SQL.Database(uint8);
    dbLocalizedLang = lang as 'en-US' | 'zh-CN' | 'zh-HK';
    return dbLocalized;
  } catch (error) {
    console.error('Failed to initialize localized database:', error);
    throw error;
  }
}

// 根据 consideration_ids 获取卡片内容
export async function getConsiderationsByIds(considerationIds: string): Promise<Array<{
  id: number;
  content: string;
  classification: string;
  content_html: string;
  }>> {
  try {
    try {
      const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
      const resp = await apiGet<{ items: any[] }>(`/api/db/considerations`, { ids: considerationIds, lang });
      if (Array.isArray(resp?.items)) return resp.items as any[];
    } catch {}
    const database = await initDatabaseLocalized();
    
    // 解析 consideration_ids (格式: "1,2,3")
    const ids = considerationIds.split(',').map(id => id.trim()).filter(id => id);
    
    if (ids.length === 0) {
      return [];
    }
    
    // 构建 SQL 查询
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT id, content, classification, content_html FROM considerations WHERE id IN (${placeholders})`;
    
    // 执行查询
    const stmt = database.prepare(query);
    stmt.bind(ids);
    
    // 处理结果
    const considerations = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      considerations.push({
        id: row.id as number,
        content: row.content as string,
        classification: row.classification as string,
        content_html: row.content_html as string
      });
    }
    
    stmt.free();
    return considerations;
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
    try {
      const resp = await apiGet<{ ids: string[] }>(`/api/db/consideration-ids`, { countryName, industryName });
      if (Array.isArray(resp?.ids)) return (resp.ids || []).join(',');
    } catch {}
    const database = await initDatabaseEnglish();
    
    const query = `
      SELECT consideration_ids 
      FROM applicability_grouped 
      WHERE country_name = ? AND industry_name = ?
    `;
    
    const stmt = database.prepare(query);
    stmt.bind([countryName, industryName]);
    
    let considerationIds = '';
    if (stmt.step()) {
      const row = stmt.getAsObject();
      considerationIds = row.consideration_ids as string || '';
    }
    
    stmt.free();
    return considerationIds;
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
    const database = await initDatabaseEnglish();
    
    const query = `
      SELECT initiative_ids 
      FROM applicability_grouped 
      WHERE country_name = ? AND industry_name = ?
    `;
    
    const stmt = database.prepare(query);
    stmt.bind([countryName, industryName]);
    
    let initiativeIds: string[] = [];
    if (stmt.step()) {
      const row = stmt.getAsObject();
      const idsString = row.initiative_ids as string || '';
      if (idsString) {
        initiativeIds = idsString.split(',').map(id => id.trim()).filter(id => id);
      }
    }
    
    stmt.free();
    return initiativeIds;
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
    try {
      const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
      const resp = await apiGet<{ items: any[] }>(`/api/db/initiatives`, { ids: ids.join(','), lang });
      if (Array.isArray(resp?.items)) return resp.items as any[];
    } catch {}
    const database = await initDatabaseLocalized();
    
    // 构建 SQL 查询
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT id, name, intro, logo, link, classification, intro_html FROM initiatives WHERE id IN (${placeholders})`;
    
    // 执行查询
    const stmt = database.prepare(query);
    stmt.bind(ids);
    
    // 处理结果
    const initiatives = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      initiatives.push({
        id: row.id as number,
        name: row.name as string,
        intro: row.intro as string,
        logo: row.logo as string,
        link: row.link as string,
        classification: row.classification as string,
        intro_html: row.intro_html as string
      });
    }
    
    stmt.free();
    return initiatives;
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
    try {
      const resp = await apiGet<{ ids: string[] }>(`/api/db/organization-ids`, { countryName, industryName });
      if (Array.isArray(resp?.ids)) return resp.ids;
    } catch {}
    const database = await initDatabaseEnglish();
    const stmt = database.prepare(`
      SELECT organization_ids 
      FROM applicability_grouped 
      WHERE country_name = ? AND industry_name = ?
    `);
    
    stmt.bind([countryName, industryName]);
    
    if (stmt.step()) {
      const result = stmt.getAsObject();
      const organizationIds = result.organization_ids as string;
      
      if (organizationIds) {
        return organizationIds.split(',').map(id => id.trim());
      }
    }
    
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
    try {
      const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
      const resp = await apiGet<{ items: any[] }>(`/api/db/organizations`, { ids: ids.join(','), lang });
      if (Array.isArray(resp?.items)) return resp.items as any[];
    } catch {}
    const database = await initDatabaseLocalized();
    const placeholders = ids.map(() => '?').join(',');
    const stmt = database.prepare(`
      SELECT id, name, intro, logo, link, classification, intro_html
      FROM organizations 
      WHERE id IN (${placeholders})
    `);
    
    stmt.bind(ids);
    
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as number,
        name: row.name as string,
        intro: row.intro as string,
        logo: row.logo as string,
        link: row.link as string,
        classification: row.classification as string,
        intro_html: row.intro_html as string,
      });
    }
    
    stmt.free();
    return results;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

// 清理数据库连接
export function closeDatabase() {
  try { if (dbEnglish && typeof dbEnglish.close === 'function') dbEnglish.close(); } catch {}
  try { if (dbLocalized && typeof dbLocalized.close === 'function') dbLocalized.close(); } catch {}
  dbEnglish = null;
  dbLocalized = null;
  dbLocalizedLang = null;
}

// 根据国家和行业获取 risk_ids
export async function getRiskIdsByCountryAndIndustry(
  countryName: string,
  industryName: string
): Promise<string[]> {
  try {
    try {
      const resp = await apiGet<{ ids: string[] }>(`/api/db/risk-ids`, { countryName, industryName });
      if (Array.isArray(resp?.ids)) return resp.ids;
    } catch {}
    const database = await initDatabaseEnglish();
    const query = `SELECT risk_ids FROM applicability_grouped WHERE country_name = ? AND industry_name = ?`;
    const stmt = database.prepare(query);
    stmt.bind([countryName, industryName]);
    let riskIds: string[] = [];
    if (stmt.step()) {
      const row = stmt.getAsObject();
      const riskIdsStr = row.risk_ids as string || '';
      riskIds = riskIdsStr.split(',').map(id => id.trim()).filter(id => id);
    }
    stmt.free();
    return riskIds;
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
    try {
      const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
      const resp = await apiGet<{ items: any[] }>(`/api/db/risks`, { ids: ids.join(','), lang });
      if (Array.isArray(resp?.items)) return resp.items as any[];
    } catch {}
    const database = await initDatabaseLocalized();
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT r.id, r.issue_id, r.sub_issue_id, r.content, r.classification, r.source, r.content_html, i.issue_name, s.sub_issue_name FROM risks r LEFT JOIN issues i ON r.issue_id = i.id LEFT JOIN sub_issues s ON r.sub_issue_id = s.id WHERE r.id IN (${placeholders})`;
    const stmt = database.prepare(query);
    stmt.bind(ids);
    const risks = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      risks.push(row);
    }
    stmt.free();
    return risks;
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
    try {
      const resp = await apiGet<{ ids: string[] }>(`/api/db/advice-ids`, { countryName, industryName });
      if (Array.isArray(resp?.ids)) return resp.ids;
    } catch {}
    const database = await initDatabaseEnglish();
    const query = `SELECT advice_ids FROM applicability_grouped WHERE country_name = ? AND industry_name = ?`;
    const stmt = database.prepare(query);
    stmt.bind([countryName, industryName]);
    let adviceIds: string[] = [];
    if (stmt.step()) {
      const row = stmt.getAsObject();
      const adviceIdsStr = row.advice_ids as string || '';
      adviceIds = adviceIdsStr.split(',').map(id => id.trim()).filter(id => id);
    }
    stmt.free();
    return adviceIds;
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
    try {
      const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
      const resp = await apiGet<{ items: any[] }>(`/api/db/advice`, { ids: ids.join(','), lang });
      if (Array.isArray(resp?.items)) return resp.items as any[];
    } catch {}
    const database = await initDatabaseLocalized();
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT a.id, a.issue_id, a.sub_issue_id, a.content, a.classification, a.source, a.content_html, i.issue_name, s.sub_issue_name FROM advice a LEFT JOIN issues i ON a.issue_id = i.id LEFT JOIN sub_issues s ON a.sub_issue_id = s.id WHERE a.id IN (${placeholders})`;
    const stmt = database.prepare(query);
    stmt.bind(ids);
    const advice = [];
    while (stmt.step()) advice.push(stmt.getAsObject());
    stmt.free();
    return advice;
  } catch (error) {
    console.error('Failed to get advice:', error);
    return [];
  }
}

export async function warmupDatabases(): Promise<void> {
  try { await loadSQL(); } catch {}
  try {
    await apiGet('/api/health');
    return;
  } catch {}
  try { await fetch(enDbUrl); } catch {}
  try {
    const lang = (typeof window !== 'undefined' && (window as any).__fvLanguage) || localStorage.getItem('language') || 'en-US';
    const url = lang === 'zh-CN' ? cnDbUrl : (lang === 'zh-HK' ? hkDbUrl : enDbUrl);
    await fetch(url);
  } catch {}
}

export async function prefetchAllDatabases(): Promise<void> {
  try { await loadSQL(); } catch {}
  try {
    await apiGet('/api/health');
    return;
  } catch {}
  try {
    await Promise.all([
      fetch(enDbUrl),
      fetch(cnDbUrl),
      fetch(hkDbUrl)
    ]);
  } catch {}
}
