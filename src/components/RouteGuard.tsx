import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { getInviteCodeByCode } from '@/data/inviteCodes';
import { getApiBaseUrl } from '@/lib/utils';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite-code');
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyInviteCode = async () => {
      if (!inviteCode?.trim()) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      const trimmedCode = inviteCode.trim().toLowerCase();

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

  // 如果有邀请码且有效，允许访问页面
  if (inviteCode && isValid) {
    return <>{children}</>;
  }

  // 否则重定向到首页
  return <Navigate to="/" replace />;
};

export default RouteGuard;