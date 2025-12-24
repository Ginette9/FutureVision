import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Navigate, useLocation } from 'react-router-dom';
import { getInviteCodeByCode } from '@/data/inviteCodes';
import { getApiBaseUrl } from '@/lib/utils';
import { AuthContext } from '../contexts/authContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite-code');
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isCodeUsed, setIsCodeUsed] = useState(false);

  useEffect(() => {
    const verifyInviteCode = async () => {
      if (!inviteCode?.trim()) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      const trimmedCode = inviteCode.trim().toLowerCase();
      
      // 检查邀请码类型，仅对次数型邀请码应用使用限制
      const codeInfo = getInviteCodeByCode(trimmedCode);
      if (codeInfo?.type === 'count') {
        // 仅对次数型邀请码检查是否已经被使用过
        const usedCodes = JSON.parse(localStorage.getItem('usedInviteCodes') || '{}');
        if (usedCodes[trimmedCode] && (usedCodes[trimmedCode] === true || usedCodes[trimmedCode].used)) {
          setIsCodeUsed(true);
        }
      }

      try {
        // 直接通过API验证邀请码（统一使用后端邀请码系统）
        const base = getApiBaseUrl();
        const endpoints = [
          base ? `${base}/api/verify-invite-code` : null,
          '/api/verify-invite-code',
          'http://localhost:3001/api/verify-invite-code',
          'http://localhost:3002/api/verify-invite-code'
        ].filter(Boolean) as string[];

        
        const userIp = await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip)
          .catch(() => 'unknown');

        for (const ep of endpoints) {
          try {
            const response = await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: trimmedCode,
                ip: userIp,
                isRouteGuard: true
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.valid) {
                setIsValid(true);
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error verifying invite code via API:', error);
          }
        }

        // 如果所有API都失败，验证失败
        setIsValid(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in invite code verification:', error);
        // 出错时验证失败
        setIsValid(false);
        setIsLoading(false);
      }
    };

    verifyInviteCode();
  }, [inviteCode]);

  // 加载中时显示空内容或加载动画
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 检查是否在ESG风险评估表页面且邀请码已被使用
  // 注意：应用使用HashRouter，所以路径在location.hash中
  const isOnESGFormPage = location.hash === '#/esg-voyant' || location.hash === '#/form' || location.hash === '#/esg-voyant/form';
  
  // 如果在表单页面且邀请码已被使用，直接重定向到首页
  if (isOnESGFormPage && inviteCode && isCodeUsed) {
    return <Navigate to="/" replace />;
  }

  // 如果有邀请码且有效，并且不在表单页面，允许访问页面
  // 对于表单页面，还需要确保邀请码未被使用
  if (inviteCode && isValid && (!isOnESGFormPage || !isCodeUsed)) {
    return <>{children}</>;
  }

  // 否则重定向到首页
  return <Navigate to="/" replace />;
};

export default RouteGuard;