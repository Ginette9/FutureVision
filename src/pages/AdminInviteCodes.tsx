import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../contexts/authContext';
import { InviteCodeItem } from '../data/inviteCodes';
import { getApiBaseUrl } from '../lib/utils';

const AdminInviteCodes = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [existingCodes, setExistingCodes] = useState<InviteCodeItem[]>([]);
  
  // 批量选择状态
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  
  // 新增邀请码表单状态
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [codeType, setCodeType] = useState<'count' | 'time'>('count');
  const [maxUses, setMaxUses] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [batchSize, setBatchSize] = useState(1);
  const [generateMode, setGenerateMode] = useState<'manual' | 'batch'>('manual');

  // 处理单个选择
  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedCodes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCodes(newSelected);
  };

  // 处理全选
  const handleSelectAll = (codes: InviteCodeItem[]) => {
    if (codes.every(code => selectedCodes.has(code.id))) {
      // 取消全选
      const newSelected = new Set(selectedCodes);
      codes.forEach(code => newSelected.delete(code.id));
      setSelectedCodes(newSelected);
    } else {
      // 全选
      const newSelected = new Set(selectedCodes);
      codes.forEach(code => newSelected.add(code.id));
      setSelectedCodes(newSelected);
    }
  };

  // 检查是否选中
  const isSelected = (id: string) => selectedCodes.has(id);

  // 检查是否全选
  const isAllSelected = (codes: InviteCodeItem[]) => {
    if (codes.length === 0) return false;
    return codes.every(code => selectedCodes.has(code.id));
  };

  // 从后端API获取邀请码
  const fetchInviteCodes = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/admin/invite-codes`, {
        headers: {
          'Authorization': `Bearer ${import.meta?.env?.VITE_ADMIN_PASSWORD || 'admin123456'}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // 将后端返回的结构化邀请码转换为InviteCodeItem格式
        const formattedCodes = data.codes.map((codeObj: any) => ({
          id: codeObj.code,
          code: codeObj.code,
          type: codeObj.type,
          name: codeObj.name || `${codeObj.code} 邀请码`,
          description: codeObj.description || (codeObj.type === 'count' ? `使用次数: ${codeObj.currentUses}/${codeObj.maxUses}` : `有效期: ${new Date(codeObj.startDate).toLocaleString()} - ${new Date(codeObj.endDate).toLocaleString()}`),
          createdAt: codeObj.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: codeObj.active !== undefined ? codeObj.active : true,
          allowDownload: codeObj.code.toLowerCase() === 'mscfv',
          allowNewAnalysis: codeObj.code.toLowerCase() === 'mscfv',
          maxUses: codeObj.maxUses,
          currentUses: codeObj.currentUses,
          startDate: codeObj.startDate,
          endDate: codeObj.endDate
        }));
        setExistingCodes(formattedCodes);
      }
    } catch (error) {
      console.error('获取邀请码失败:', error);
    }
  };

  // 加载邀请码数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchInviteCodes();
    }
  }, [isAuthenticated]);

  // 处理登录
  const handleLogin = (code: string) => {
    // 获取环境变量中的管理员密码
    const adminPassword = import.meta?.env?.VITE_ADMIN_PASSWORD || import.meta?.env?.ADMIN_PASSWORD || 'admin123456';
    if (code && code.trim() === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminLogin', '1');
      try {
        localStorage.setItem('adminToken', code.trim());
      } catch {}
    }
  };

  // 检查登录状态
  useEffect(() => {
    if (sessionStorage.getItem('adminLogin') === '1') {
      setIsAuthenticated(true);
    }
  }, [setIsAuthenticated]);

  // 添加新邀请码
  const handleAddCode = async () => {
    // 表单验证
    if (generateMode === 'manual' && !newCode.trim()) {
      alert('请输入邀请码');
      return;
    }

    if (codeType === 'time' && (!startDate || !endDate)) {
      alert('请选择开始时间和结束时间');
      return;
    }

    if (codeType === 'count' && maxUses < 1) {
      alert('最大使用次数必须大于0');
      return;
    }

    try {
      const apiBaseUrl = getApiBaseUrl();
      const requestBody: any = {
        type: codeType,
        batchSize: generateMode === 'manual' ? 1 : batchSize
      };

      // 根据生成模式和类型添加相应参数
      if (generateMode === 'manual') {
        requestBody.code = newCode.trim().toLowerCase();
      }

      if (codeType === 'count') {
        requestBody.maxUses = maxUses;
      } else {
        requestBody.startDate = startDate;
        requestBody.endDate = endDate;
      }

      const response = await fetch(`${apiBaseUrl}/api/admin/invite-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta?.env?.VITE_ADMIN_PASSWORD || 'admin123456'}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // 重新获取最新的邀请码列表
        fetchInviteCodes();
        // 清空表单
        if (generateMode === 'manual') {
          setNewCode('');
          setNewName('');
          setNewDescription('');
        }
        alert(generateMode === 'manual' ? '邀请码添加成功' : `成功生成${batchSize}个邀请码`);
      } else {
        const errorData = await response.json();
        alert('添加失败: ' + (errorData.message || '未知错误'));
      }
    } catch (error) {
      console.error('添加邀请码失败:', error);
      alert('添加失败: 网络错误');
    }
  };

  // 更新邀请码
  const handleUpdateCode = (id: string, field: keyof Omit<InviteCodeItem, 'id' | 'createdAt' | 'updatedAt'>, value: any) => {
    // 注意：后端API目前不支持更新邀请码名称和描述，只能更新激活状态
    // 这里只更新本地状态，实际业务中可能需要后端API支持
    const updatedCodes = existingCodes.map(codeItem => {
      if (codeItem.id === id) {
        return { ...codeItem, [field]: value };
      }
      return codeItem;
    });
    setExistingCodes(updatedCodes);
  };

  // 删除邀请码
  const handleDeleteCode = async (id: string) => {
    if (window.confirm('确定要删除此邀请码吗？')) {
      try {
        const codeToDelete = existingCodes.find(item => item.id === id)?.code;
        if (!codeToDelete) return;

        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/admin/invite-codes/${encodeURIComponent(codeToDelete)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${import.meta?.env?.VITE_ADMIN_PASSWORD || 'admin123456'}`
          }
        });

        if (response.ok) {
          // 重新获取最新的邀请码列表
          fetchInviteCodes();
          // 从选中列表中移除已删除的邀请码
          const newSelected = new Set(selectedCodes);
          newSelected.delete(id);
          setSelectedCodes(newSelected);
          alert('邀请码删除成功');
        } else {
          const errorData = await response.json();
          alert('删除失败: ' + (errorData.message || '未知错误'));
        }
      } catch (error) {
        console.error('删除邀请码失败:', error);
        alert('删除失败: 网络错误');
      }
    }
  };

  // 批量删除邀请码
  const handleBatchDelete = async () => {
    if (selectedCodes.size === 0) return;
    
    if (window.confirm(`确定要删除选中的 ${selectedCodes.size} 个邀请码吗？`)) {
      try {
        const codesToDelete = existingCodes.filter(code => selectedCodes.has(code.id)).map(code => code.code);
        if (codesToDelete.length === 0) return;

        const apiBaseUrl = getApiBaseUrl();
        let successCount = 0;
        
        // 循环调用单个删除的API端点
        for (const code of codesToDelete) {
          const response = await fetch(`${apiBaseUrl}/api/admin/invite-codes/${encodeURIComponent(code)}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${import.meta?.env?.VITE_ADMIN_PASSWORD || 'admin123456'}`
            }
          });
          
          if (response.ok) {
            successCount++;
          }
        }

        // 重新获取最新的邀请码列表
        fetchInviteCodes();
        // 清空选中列表
        setSelectedCodes(new Set());
        alert(`成功删除 ${successCount} 个邀请码`);
      } catch (error) {
        console.error('批量删除邀请码失败:', error);
        alert('批量删除失败: 网络错误');
      }
    }
  };

  // 生成CSV格式字符串
  const generateCSV = (codes: InviteCodeItem[]) => {
    // 标题行
    const headers = ['邀请码', '类型', '名称', '描述', '最大使用次数', '已使用次数', '开始时间', '结束时间', '状态', '创建时间'];
    
    // 转换数据行
    const rows = codes.map(code => [
      `"${code.code}"`, // 邀请码
      code.type, // 类型
      `"${code.name || ''}"`, // 名称
      `"${code.description || ''}"`, // 描述
      code.type === 'count' ? code.maxUses : '', // 最大使用次数
      code.type === 'count' ? code.currentUses : '', // 已使用次数
      code.type === 'time' && code.startDate ? `"${new Date(code.startDate).toLocaleString()}"` : '', // 开始时间
      code.type === 'time' && code.endDate ? `"${new Date(code.endDate).toLocaleString()}"` : '', // 结束时间
      code.active ? '激活' : '禁用', // 状态
      `"${new Date(code.createdAt).toLocaleString()}"` // 创建时间
    ]);
    
    // 组合CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };

  // 导出邀请码为CSV
  const exportInviteCodes = () => {
    const csvContent = generateCSV(existingCodes);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invite-codes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 按类型导出邀请码
  const exportInviteCodesByType = (type: 'count' | 'time') => {
    const filteredCodes = existingCodes.filter(code => code.type === type);
    const csvContent = generateCSV(filteredCodes);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invite-codes-${type === 'count' ? 'count' : 'time'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出选中的邀请码
  const exportSelectedInviteCodes = () => {
    const selectedCodesArray = existingCodes.filter(code => selectedCodes.has(code.id));
    const csvContent = generateCSV(selectedCodesArray);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invite-codes-selected.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入功能的文件引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导入邀请码
  const handleImportInviteCodes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('inviteCodesFile', file);

      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/admin/invite-codes/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta?.env?.VITE_ADMIN_PASSWORD || 'admin123456'}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        await fetchInviteCodes();
        alert(`成功导入 ${result.successCount} 个邀请码，跳过 ${result.skipCount} 个重复邀请码`);
      } else {
        const errorData = await response.json();
        alert('导入失败: ' + (errorData.message || '未知错误'));
      }
    } catch (error) {
      console.error('导入邀请码失败:', error);
      alert('导入失败: 网络错误');
    } finally {
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 未登录状态显示登录界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-semibold text-center mb-6">管理员登录</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="请输入管理员密码"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin(e.currentTarget.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                handleLogin(input.value);
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 已登录状态显示管理界面
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">邀请码管理</h1>
        
        {/* 添加新邀请码 */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">添加新邀请码</h2>
          
          {/* 邀请码类型选择 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邀请码类型</label>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value as 'count' | 'time')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="count">按使用次数管理</option>
                <option value="time">按使用时间管理</option>
              </select>
            </div>
            
            {/* 生成模式选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生成模式</label>
              <select
                value={generateMode}
                onChange={(e) => setGenerateMode(e.target.value as 'manual' | 'batch')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">手动输入</option>
                <option value="batch">批量生成</option>
              </select>
            </div>
            
            {/* 批量生成数量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">批量数量</label>
              <input
                type="number"
                min="1"
                max="100"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* 根据生成模式显示不同的表单 */}
          {generateMode === 'manual' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="邀请码"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="名称（可选）"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="描述（可选）"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
              />
            </div>
          )}
          
          {/* 根据邀请码类型显示不同的字段 */}
          {codeType === 'count' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">最大使用次数</label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {codeType === 'time' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleAddCode}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {generateMode === 'manual' ? '添加邀请码' : `批量生成${batchSize}个邀请码`}
          </button>
        </div>

        {/* 批量操作按钮 */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8 flex flex-wrap gap-4">
          <button
            onClick={handleBatchDelete}
            disabled={selectedCodes.size === 0}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            批量删除 ({selectedCodes.size})
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportInviteCodes}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              导出全部
            </button>
            <button
              onClick={() => exportInviteCodesByType('count')}
              disabled={existingCodes.filter(code => code.type === 'count').length === 0}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              导出按次数管理
            </button>
            <button
              onClick={() => exportInviteCodesByType('time')}
              disabled={existingCodes.filter(code => code.type === 'time').length === 0}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              导出按时间管理
            </button>
            <button
              onClick={exportSelectedInviteCodes}
              disabled={selectedCodes.size === 0}
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              导出选中 ({selectedCodes.size})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleImportInviteCodes}
              className="hidden"
              id="import-csv"
            />
            <label
              htmlFor="import-csv"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              批量导入
            </label>
          </div>
        </div>

        {/* 邀请码列表 - 按类型分开 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 按次数管理的邀请码 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">按次数管理的邀请码</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={isAllSelected(existingCodes.filter(code => code.type === 'count'))}
                        onChange={() => handleSelectAll(existingCodes.filter(code => code.type === 'count'))}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邀请码</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最大使用次数</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已使用次数</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下载报告</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">新建分析</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {existingCodes
                    .filter(code => code.type === 'count')
                    .map((code) => (
                      <tr key={code.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected(code.id)}
                            onChange={() => handleSelectOne(code.id)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={code.code}
                            onChange={(e) => handleUpdateCode(code.id, 'code', e.target.value.toUpperCase())}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={code.name}
                            onChange={(e) => handleUpdateCode(code.id, 'name', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {code.maxUses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {code.currentUses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={code.allowDownload}
                            onChange={(e) => handleUpdateCode(code.id, 'allowDownload', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={code.allowNewAnalysis}
                            onChange={(e) => handleUpdateCode(code.id, 'allowNewAnalysis', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={code.active ? '1' : '0'}
                            onChange={(e) => handleUpdateCode(code.id, 'active', e.target.value === '1')}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="1">激活</option>
                            <option value="0">禁用</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(code.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 按时间管理的邀请码 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">按时间管理的邀请码</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={isAllSelected(existingCodes.filter(code => code.type === 'time'))}
                        onChange={() => handleSelectAll(existingCodes.filter(code => code.type === 'time'))}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邀请码</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束时间</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下载报告</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">新建分析</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {existingCodes
                    .filter(code => code.type === 'time')
                    .map((code) => (
                      <tr key={code.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected(code.id)}
                            onChange={() => handleSelectOne(code.id)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={code.code}
                            onChange={(e) => handleUpdateCode(code.id, 'code', e.target.value.toUpperCase())}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={code.name}
                            onChange={(e) => handleUpdateCode(code.id, 'name', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {code.startDate ? new Date(code.startDate).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {code.endDate ? new Date(code.endDate).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={code.allowDownload}
                            onChange={(e) => handleUpdateCode(code.id, 'allowDownload', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={code.allowNewAnalysis}
                            onChange={(e) => handleUpdateCode(code.id, 'allowNewAnalysis', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={code.active ? '1' : '0'}
                            onChange={(e) => handleUpdateCode(code.id, 'active', e.target.value === '1')}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="1">激活</option>
                            <option value="0">禁用</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(code.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInviteCodes;