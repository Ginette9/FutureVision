// 邀请码数据管理

// 邀请码类型定义
export interface InviteCodeItem {
  id: string;
  code: string;              // 邀请码
  name: string;              // 邀请码名称
  description?: string;      // 邀请码描述
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  active: boolean;           // 是否激活
}

// 邀请码数据存储
// 从环境变量获取邀请码，如果没有则使用默认值
const envInviteCodes = import.meta?.env?.VITE_INVITE_CODES || 'TESTCODE123,FREE2025,TESTVIP,MSCFV';

// 解析环境变量中的邀请码
let inviteCodes: InviteCodeItem[] = envInviteCodes.split(',').map((code: string, index: number) => ({
  id: `invite-${index + 1}`,
  code: code.trim(),
  name: `${code.trim()} 邀请码`,
  description: `${code.trim()} 邀请码描述`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  active: true
}));

// 获取所有邀请码
export function getAllInviteCodes(): InviteCodeItem[] {
  return [...inviteCodes];
}

// 根据邀请码获取邀请码信息
export function getInviteCodeByCode(code: string): InviteCodeItem | undefined {
  const lowercaseCode = code.toLowerCase().trim();
  return inviteCodes.find(item => item.code.toLowerCase().trim() === lowercaseCode);
}

// 添加新邀请码
export function addInviteCode(item: Omit<InviteCodeItem, 'id' | 'createdAt' | 'updatedAt'>): InviteCodeItem {
  const now = new Date().toISOString();
  const newItem: InviteCodeItem = {
    id: `invite-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    ...item
  };
  inviteCodes = [...inviteCodes, newItem];
  return newItem;
}

// 更新邀请码
export function updateInviteCode(id: string, updates: Partial<Omit<InviteCodeItem, 'id' | 'createdAt'>>): boolean {
  const index = inviteCodes.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  inviteCodes = [
    ...inviteCodes.slice(0, index),
    { ...inviteCodes[index], ...updates, updatedAt: new Date().toISOString() },
    ...inviteCodes.slice(index + 1)
  ];
  return true;
}

// 删除邀请码
export function deleteInviteCode(id: string): boolean {
  const initialLength = inviteCodes.length;
  inviteCodes = inviteCodes.filter(item => item.id !== id);
  return inviteCodes.length !== initialLength;
}

// 批量替换邀请码
export function replaceInviteCodes(newCodes: InviteCodeItem[]): void {
  inviteCodes = newCodes;
}
