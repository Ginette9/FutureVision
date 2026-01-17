import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { apiGet, apiPost } from '@/lib/utils';

type VisitorItem = { path: string; referrer: string; lang: string; ua: string; ip: string; ts: string };
type SummaryItem = { path: string; count: number };
type IpSummaryItem = { ip: string; count: number; lastTs: string; paths: { path: string; count: number }[] };
type ContactItem = { name: string; email: string; company: string; position: string; phone: string; message: string; ts: string };
type SubscriptionItem = { email: string; category: string; ts: string };
type LeadItem = { name: string; email: string; position: string; organization: string; phone: string; industryId: string; industryName: string; countryId: string; countryName: string; inviteCode?: string; ts: string };

export default function AdminAnalytics() {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [ipSummary, setIpSummary] = useState<IpSummaryItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [subs, setSubs] = useState<SubscriptionItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filterPath, setFilterPath] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [visitorsPage, setVisitorsPage] = useState(1);
  const [visitorsPageSize, setVisitorsPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState<'visitors' | 'contacts' | 'subscriptions' | 'leads'>('visitors');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importAllFiles, setImportAllFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const importAllFilesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem('adminLogin') === '1') setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  const handleLogin = (code: string) => {
    // 获取环境变量中的管理员密码
    const adminPassword = import.meta?.env?.VITE_ADMIN_PASSWORD || import.meta?.env?.ADMIN_PASSWORD || 'admin123456';
    if (code && code.trim() === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminLogin', '1');
      try { localStorage.setItem('adminToken', code.trim()); } catch {}
    }
  };

  const loadAll = async () => {
    try {
      const v = await apiGet<{ items: VisitorItem[]; count: number }>(`/api/visitors`);
      setVisitors(Array.isArray(v?.items) ? v.items : []);
    } catch {}
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const s = await apiGet<{ items: SummaryItem[]; total: number }>(`/api/visitors/summary`, params);
      setSummary(Array.isArray(s?.items) ? s.items : []);
    } catch {}
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const ip = await apiGet<{ items: IpSummaryItem[]; totalIps: number; totalVisits: number }>(`/api/visitors/summary-by-ip`, params);
      setIpSummary(Array.isArray(ip?.items) ? ip.items : []);
    } catch {}
    try {
      const c = await apiGet<{ items: ContactItem[]; count: number }>(`/api/contacts`);
      setContacts(Array.isArray(c?.items) ? c.items : []);
    } catch {}
    try {
      const sb = await apiGet<{ items: SubscriptionItem[]; count: number }>(`/api/subscriptions`);
      setSubs(Array.isArray(sb?.items) ? sb.items : []);
    } catch {}
    try {
      const l = await apiGet<{ items: LeadItem[]; count: number }>(`/api/esg-forms`);
      setLeads(Array.isArray(l?.items) ? l.items : []);
    } catch {}
  };

  useEffect(() => { if (isAuthenticated) loadAll(); }, [isAuthenticated]);

  // 导出CSV功能
  const handleExport = (type: 'visitors' | 'contacts' | 'subscriptions' | 'leads') => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = '';

    switch (type) {
      case 'visitors':
        data = visitors;
        headers = ['时间', '路径', '来源', '语言', 'IP'];
        filename = `visitors-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      case 'contacts':
        data = contacts;
        headers = ['时间', '姓名', '邮箱', '公司', '职位', '电话', '留言'];
        filename = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      case 'subscriptions':
        data = subs;
        headers = ['时间', '邮箱', '类别'];
        filename = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      case 'leads':
        data = leads;
        headers = ['时间', '姓名', '邮箱', '职位', '机构', '电话', '行业', '国家/地区', '邀请码'];
        filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
    }

    const rows = data.map(item => {
      switch (type) {
        case 'visitors':
          return [item.ts, item.path, item.referrer, item.lang, item.ip].map(field => `"${String(field || '').replace(/"/g, '""')}"`);
        case 'contacts':
          return [item.ts, item.name, item.email, item.company, item.position, item.phone, item.message].map(field => `"${String(field || '').replace(/"/g, '""')}"`);
        case 'subscriptions':
          return [item.ts, item.email, item.category].map(field => `"${String(field || '').replace(/"/g, '""')}"`);
        case 'leads':
          return [item.ts, item.name, item.email, item.position, item.organization, item.phone, item.industryName, item.countryName, item.inviteCode || ''].map(field => `"${String(field || '').replace(/"/g, '""')}"`);
        default:
          return [];
      }
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 添加UTF-8 BOM标记，确保Excel等应用程序能正确识别编码
    const bom = '\ufeff';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 清空数据功能
  const handleClear = async (type: 'visitors' | 'contacts' | 'subscriptions' | 'leads') => {
    if (!confirm(`确定要清空${type === 'visitors' ? '访客' : type === 'contacts' ? '联系' : type === 'subscriptions' ? '订阅' : 'ESG表单'}数据吗？`)) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      await apiPost(`/api/admin/analytics/clear/${type}`, {});
      setMessage(`成功清空${type === 'visitors' ? '访客' : type === 'contacts' ? '联系' : type === 'subscriptions' ? '订阅' : 'ESG表单'}数据`);
      loadAll();
    } catch (error) {
      setMessage('清空数据失败，请重试');
      console.error('清空数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 一键导出所有数据功能
  const handleExportAll = () => {
    // 依次导出所有数据类型
    handleExport('visitors');
    handleExport('contacts');
    handleExport('subscriptions');
    handleExport('leads');
    setMessage('正在导出所有数据，请稍候...');
  };

  // 一键清空所有数据功能
  const handleClearAll = async () => {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      // 依次清空所有数据类型
      await apiPost(`/api/admin/analytics/clear/visitors`, {});
      await apiPost(`/api/admin/analytics/clear/contacts`, {});
      await apiPost(`/api/admin/analytics/clear/subscriptions`, {});
      await apiPost(`/api/admin/analytics/clear/leads`, {});
      setMessage('成功清空所有数据');
      loadAll();
    } catch (error) {
      setMessage('清空所有数据失败，请重试');
      console.error('清空所有数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 一键导入所有数据功能
  const handleImportAllClick = () => {
    importAllFilesRef.current?.click();
  };

  const handleImportAllFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImportAllFiles(Array.from(files));
      handleImportAll(Array.from(files));
    }
  };

  const handleImportAll = async (files: File[]) => {
    if (files.length === 0) {
      setMessage('请选择要导入的文件');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      let totalSuccess = 0;

      // 为每个文件尝试导入到最匹配的数据类型
      for (const file of files) {
        // 根据文件名和内容猜测数据类型
        const fileName = file.name.toLowerCase();
        let guessedType: 'visitors' | 'contacts' | 'subscriptions' | 'leads' = 'visitors';

        // 根据文件名猜测类型
        if (fileName.includes('visitor')) {
          guessedType = 'visitors';
        } else if (fileName.includes('contact')) {
          guessedType = 'contacts';
        } else if (fileName.includes('subscrib') || fileName.includes('subscription') || fileName.includes('subs') || fileName.includes('sub')) {
          guessedType = 'subscriptions';
        } else if (fileName.includes('lead') || fileName.includes('esg')) {
          guessedType = 'leads';
        }

        // 尝试导入到猜测的类型
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', guessedType);

          const response = await apiPost(`/api/admin/analytics/import`, formData);
          totalSuccess += response.successCount || 0;
        } catch (error) {
          console.error(`导入文件 ${file.name} 失败:`, error);
        }
      }

      setMessage(`成功导入 ${totalSuccess} 条数据`);
      loadAll();
    } catch (error) {
      setMessage('导入所有数据失败，请重试');
      console.error('导入所有数据失败:', error);
    } finally {
      setIsLoading(false);
      setImportAllFiles([]);
      // 重置文件输入，以便可以再次选择相同的文件
      if (importAllFilesRef.current) {
        importAllFilesRef.current.value = '';
      }
    }
  };

  // 导入数据功能
  const handleImport = async () => {
    if (!importFile) {
      setMessage('请选择要导入的CSV文件');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', importType);

      const response = await apiPost(`/api/admin/analytics/import`, formData);

      setMessage(`成功导入${response.successCount || 0}条数据`);
      loadAll();
      setImportFile(null);
    } catch (error) {
      setMessage('导入数据失败，请重试');
      console.error('导入数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVisitors = useMemo(() => {
    const fp = filterPath.trim().toLowerCase();
    const arr = visitors.filter(v => (fp ? String(v.path || '').toLowerCase().includes(fp) : true));
    return arr;
  }, [visitors, filterPath]);

  const visitorsPaged = useMemo(() => {
    const ordered = filteredVisitors.slice().reverse();
    const total = ordered.length;
    const pages = Math.max(1, Math.ceil(total / visitorsPageSize));
    const safePage = Math.min(Math.max(1, visitorsPage), pages);
    const start = (safePage - 1) * visitorsPageSize;
    const end = start + visitorsPageSize;
    return { rows: ordered.slice(start, end), total, pages, page: safePage };
  }, [filteredVisitors, visitorsPage, visitorsPageSize]);

  useEffect(() => { setVisitorsPage(1); }, [filterPath, from, to]);

  const filteredContacts = useMemo(() => {
    const fe = filterEmail.trim().toLowerCase();
    return contacts.filter(v => (fe ? String(v.email || '').toLowerCase().includes(fe) : true));
  }, [contacts, filterEmail]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto pt-24 pb-16 px-4">
        <h2 className="text-2xl font-semibold mb-4">管理员登录</h2>
        <input className="border px-3 py-2 w-full mb-4" placeholder="邀请码" onKeyDown={(e) => { if ((e as any).key === 'Enter') handleLogin((e.target as HTMLInputElement).value); }} />
        <button className="px-4 py-2 bg-gray-900 text-white" onClick={() => { const input = document.querySelector('input[placeholder="邀请码"]') as HTMLInputElement; handleLogin(input?.value || ''); }}>登录</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-24 pb-20 px-4 space-y-8">
      <h2 className="text-3xl font-semibold">站点数据概览</h2>
      
      {/* 数据管理功能区 */}
      <div className="border rounded p-4 space-y-4">
        <h3 className="text-lg font-semibold">数据管理</h3>
        
        {/* 总一键功能 */}
        <div className="space-y-2">
          <div className="font-medium">总一键操作</div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded" onClick={handleExportAll}>一键导出所有数据</button>
            <button className="px-3 py-1.5 bg-red-600 text-white rounded" onClick={handleClearAll}>一键清空所有数据</button>
            <button className="px-3 py-1.5 bg-green-600 text-white rounded" onClick={handleImportAllClick}>一键导入所有数据</button>
          </div>
          <input 
            type="file" 
            className="border px-2 py-1 hidden" 
            accept=".csv,.tsv" 
            multiple 
            ref={importAllFilesRef} 
            onChange={handleImportAllFilesChange}
            id="import-all-files"
          />
          <label htmlFor="import-all-files" className="text-sm text-gray-600 cursor-pointer hover:underline">选择多个CSV/TSV文件（支持访客、联系、订阅、ESG表单数据）</label>
        </div>
        
        {/* 导出功能 */}
        <div className="space-y-2">
          <div className="font-medium">导出数据</div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded" onClick={() => handleExport('visitors')}>导出访客数据</button>
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded" onClick={() => handleExport('contacts')}>导出联系数据</button>
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded" onClick={() => handleExport('subscriptions')}>导出订阅数据</button>
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded" onClick={() => handleExport('leads')}>导出ESG表单数据</button>
          </div>
        </div>
        
        {/* 清空功能 */}
        <div className="space-y-2">
          <div className="font-medium">清空数据</div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-red-500 text-white rounded" onClick={() => handleClear('visitors')}>清空访客数据</button>
            <button className="px-3 py-1.5 bg-red-500 text-white rounded" onClick={() => handleClear('contacts')}>清空联系数据</button>
            <button className="px-3 py-1.5 bg-red-500 text-white rounded" onClick={() => handleClear('subscriptions')}>清空订阅数据</button>
            <button className="px-3 py-1.5 bg-red-500 text-white rounded" onClick={() => handleClear('leads')}>清空ESG表单数据</button>
          </div>
        </div>
        
        {/* 导入功能 */}
        <div className="space-y-2">
          <div className="font-medium">导入数据</div>
          <div className="flex flex-wrap gap-2 items-center">
            <select 
              className="border px-2 py-1" 
              value={importType} 
              onChange={e => setImportType(e.target.value as any)}
            >
              <option value="visitors">访客数据</option>
              <option value="contacts">联系数据</option>
              <option value="subscriptions">订阅数据</option>
              <option value="leads">ESG表单数据</option>
            </select>
            <input 
              type="file" 
              className="border px-2 py-1" 
              accept=".csv,.tsv" 
              onChange={e => setImportFile(e.target.files?.[0] || null)}
            />
            <button 
              className="px-3 py-1.5 bg-green-500 text-white rounded" 
              onClick={handleImport}
              disabled={!importFile || isLoading}
            >
              {isLoading ? '导入中...' : '导入数据'}
            </button>
          </div>
        </div>
        
        {/* 消息提示 */}
        {message && (
          <div className="p-2 bg-gray-100 rounded">
            {message}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600">访客总数</div>
          <div className="text-2xl font-semibold">{visitors.length}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600">联系提交</div>
          <div className="text-2xl font-semibold">{contacts.length}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600">订阅数</div>
          <div className="text-2xl font-semibold">{subs.length}</div>
        </div>
      </div>

      <div className="border rounded p-4 space-y-4">
        <div className="flex items-center gap-2">
          <input type="date" className="border px-2 py-1" value={from} onChange={e => setFrom(e.target.value)} />
          <span>至</span>
          <input type="date" className="border px-2 py-1" value={to} onChange={e => setTo(e.target.value)} />
          <button className="px-3 py-1.5 bg-gray-900 text-white rounded" onClick={loadAll}>刷新</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">页面路径</th>
                <th className="px-2 py-1">访问次数</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.path} className="border-t">
                  <td className="px-2 py-1 font-medium">{s.path || '/'}</td>
                  <td className="px-2 py-1">{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded p-4 space-y-4">
        <h3 className="text-lg font-semibold">按 IP 汇总</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">IP</th>
                <th className="px-2 py-1">访问次数</th>
                <th className="px-2 py-1">最近时间</th>
                <th className="px-2 py-1">Top 路径</th>
              </tr>
            </thead>
            <tbody>
              {ipSummary.map((ip) => (
                <tr key={ip.ip} className="border-t">
                  <td className="px-2 py-1">{ip.ip || '-'}</td>
                  <td className="px-2 py-1">{ip.count}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{ip.lastTs}</td>
                  <td className="px-2 py-1">
                    {ip.paths.slice(0, 3).map((p, idx) => (
                      <span key={p.path + idx} className="inline-block mr-2 text-gray-700">
                        {(p.path || '/')}: {p.count}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="flex items-center gap-2">
          <input className="border px-2 py-1 flex-1" placeholder="按页面过滤，如 /esg-voyant" value={filterPath} onChange={e => setFilterPath(e.target.value)} />
          <button className="px-3 py-1.5 bg-gray-100" onClick={() => setFilterPath('')}>清空</button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">每页</span>
          <select className="border px-2 py-1" value={visitorsPageSize} onChange={e => setVisitorsPageSize(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2 text-gray-600">共 {visitorsPaged.total} 条，页 {visitorsPaged.page}/{visitorsPaged.pages}</span>
          <div className="ml-auto flex items-center gap-1">
            <button className="px-2 py-1 border" onClick={() => setVisitorsPage(1)} disabled={visitorsPaged.page === 1}>首页</button>
            <button className="px-2 py-1 border" onClick={() => setVisitorsPage(Math.max(1, visitorsPaged.page - 1))} disabled={visitorsPaged.page === 1}>上一页</button>
            <button className="px-2 py-1 border" onClick={() => setVisitorsPage(Math.min(visitorsPaged.pages, visitorsPaged.page + 1))} disabled={visitorsPaged.page === visitorsPaged.pages}>下一页</button>
            <button className="px-2 py-1 border" onClick={() => setVisitorsPage(visitorsPaged.pages)} disabled={visitorsPaged.page === visitorsPaged.pages}>末页</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">时间</th>
                <th className="px-2 py-1">路径</th>
                <th className="px-2 py-1">来源</th>
                <th className="px-2 py-1">语言</th>
                <th className="px-2 py-1">IP</th>
              </tr>
            </thead>
            <tbody>
              {visitorsPaged.rows.map((v, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1 whitespace-nowrap">{v.ts}</td>
                  <td className="px-2 py-1">{v.path}</td>
                  <td className="px-2 py-1">{v.referrer}</td>
                  <td className="px-2 py-1">{v.lang}</td>
                  <td className="px-2 py-1">{v.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold">Contact</h3>
        <div className="flex items-center gap-2">
          <input className="border px-2 py-1 flex-1" placeholder="按邮箱过滤" value={filterEmail} onChange={e => setFilterEmail(e.target.value)} />
          <button className="px-3 py-1.5 bg-gray-100" onClick={() => setFilterEmail('')}>清空</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">时间</th>
                <th className="px-2 py-1">姓名</th>
                <th className="px-2 py-1">邮箱</th>
                <th className="px-2 py-1">公司</th>
                <th className="px-2 py-1">职位</th>
                <th className="px-2 py-1">电话</th>
                <th className="px-2 py-1">留言</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.slice().reverse().map((c, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1 whitespace-nowrap">{c.ts}</td>
                  <td className="px-2 py-1">{c.name}</td>
                  <td className="px-2 py-1">{c.email}</td>
                  <td className="px-2 py-1">{c.company}</td>
                  <td className="px-2 py-1">{c.position}</td>
                  <td className="px-2 py-1">{c.phone}</td>
                  <td className="px-2 py-1">{c.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold">Subscription</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">时间</th>
                <th className="px-2 py-1">邮箱</th>
                <th className="px-2 py-1">类别</th>
              </tr>
            </thead>
            <tbody>
              {subs.slice().reverse().map((s, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1 whitespace-nowrap">{s.ts}</td>
                  <td className="px-2 py-1">{s.email}</td>
                  <td className="px-2 py-1">{s.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold">ESG Voyant Form</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">时间</th>
                <th className="px-2 py-1">姓名</th>
                <th className="px-2 py-1">邮箱</th>
                <th className="px-2 py-1">职位</th>
                <th className="px-2 py-1">机构</th>
                <th className="px-2 py-1">电话</th>
                <th className="px-2 py-1">行业</th>
                <th className="px-2 py-1">国家/地区</th>
                <th className="px-2 py-1">邀请码</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice().reverse().map((l, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1 whitespace-nowrap">{l.ts}</td>
                  <td className="px-2 py-1">{l.name}</td>
                  <td className="px-2 py-1">{l.email}</td>
                  <td className="px-2 py-1">{l.position}</td>
                  <td className="px-2 py-1">{l.organization}</td>
                  <td className="px-2 py-1">{l.phone}</td>
                  <td className="px-2 py-1">{l.industryName}</td>
                  <td className="px-2 py-1">{l.countryName}</td>
                  <td className="px-2 py-1">{l.inviteCode || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
