import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/authContext';
import { InviteCodeItem, getAllInviteCodes, addInviteCode, updateInviteCode, deleteInviteCode } from '../data/inviteCodes';

const AdminInviteCodes = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [existingCodes, setExistingCodes] = useState<InviteCodeItem[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // 加载邀请码数据
  useEffect(() => {
    if (isAuthenticated) {
      setExistingCodes(getAllInviteCodes());
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
  const handleAddCode = () => {
    if (!newCode.trim()) return;

    const code = newCode.trim().toUpperCase();
    if (getAllInviteCodes().some(item => item.code.toUpperCase() === code)) {
      alert('邀请码已存在');
      return;
    }

    addInviteCode({
      code,
      name: newName.trim() || code,
      description: newDescription.trim(),
      active: true
    });

    setExistingCodes(getAllInviteCodes());
    setNewCode('');
    setNewName('');
    setNewDescription('');
  };

  // 更新邀请码
  const handleUpdateCode = (id: string, field: keyof Omit<InviteCodeItem, 'id' | 'createdAt' | 'updatedAt'>, value: any) => {
    updateInviteCode(id, { [field]: value });
    setExistingCodes(getAllInviteCodes());
  };

  // 删除邀请码
  const handleDeleteCode = (id: string) => {
    if (window.confirm('确定要删除此邀请码吗？')) {
      deleteInviteCode(id);
      setExistingCodes(getAllInviteCodes());
    }
  };

  // 导出邀请码为JSON
  const exportInviteCodes = () => {
    const blob = new Blob([JSON.stringify(getAllInviteCodes(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invite-codes.json';
    a.click();
    URL.revokeObjectURL(url);
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
          <button
            onClick={handleAddCode}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            添加邀请码
          </button>
        </div>

        {/* 邀请码列表 */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">邀请码列表</h2>
            <button
              onClick={exportInviteCodes}
              className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              导出邀请码
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邀请码</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {existingCodes.map((code) => (
                  <tr key={code.id}>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={code.description || ''}
                        onChange={(e) => handleUpdateCode(code.id, 'description', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
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
  );
};

export default AdminInviteCodes;