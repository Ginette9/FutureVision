import React, { useEffect, useState } from 'react';
import { getOrganizationIdsByCountryAndIndustry, getOrganizationsByIds } from '../../../lib/database';

interface OrganizationData {
  id: number;
  name: string;
  intro: string;
  logo: string;
  link: string;
  classification: string;
  intro_html: string;
}

export const CSRSection: React.FC<{ 
  countryName: string; 
  industryName: string; 
}> = ({ countryName, industryName }) => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 获取 organization IDs
        const organizationIds = await getOrganizationIdsByCountryAndIndustry(countryName, industryName);
        
        if (organizationIds.length > 0) {
          // 获取 organization 数据
          const organizationData = await getOrganizationsByIds(organizationIds);
          setOrganizations(organizationData);
        } else {
          setOrganizations([]);
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations');
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    if (countryName && industryName) {
      fetchOrganizations();
    }
  }, [countryName, industryName]);

  const sectionTitle = 'Relevant organizations';

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0..." />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
            <p className="text-gray-600 mt-1">Key organizations and standards in your industry</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0..." />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
            <p className="text-gray-600 mt-1">Key organizations and standards in your industry</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0..." />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
            <p className="text-gray-600 mt-1">Key organizations and standards in your industry</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">No relevant organizations found for this country and industry combination.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0..." />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">Key organizations and standards in your industry</p>
        </div>
      </div>

      {/* 组织卡片列表 */}
      <div className="space-y-6">
        {organizations.map((org) => (
          <div key={org.id} className="group bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo区域 */}
              <div className="flex-shrink-0 w-full md:w-48 flex justify-center md:justify-start">
                <div className="w-32 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-4 group-hover:bg-gray-100 transition-colors">
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={`${org.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0..." />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-light text-gray-900 group-hover:text-gray-700 transition-colors">
                    {org.name}
                  </h3>
                </div>
                <div 
                  className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: org.intro_html || org.intro }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
