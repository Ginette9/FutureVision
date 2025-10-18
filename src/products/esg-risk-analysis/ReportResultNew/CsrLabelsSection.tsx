import React, { useState, useEffect } from 'react';
import { getInitiativeIdsByCountryAndIndustry, getInitiativesByIds } from '../../../lib/database';

interface Initiative {
  id: number;
  name: string;
  intro: string;
  logo: string;
  link: string;
  classification: string;
  intro_html: string;
}

export const CsrLabelsSection: React.FC<{ 
  countryName: string; 
  industryName: string; 
}> = ({ countryName, industryName }) => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionTitle = 'ESG labels, supply chain initiatives & guidelines';

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 根据国家和行业获取 initiative IDs
        const initiativeIds = await getInitiativeIdsByCountryAndIndustry(countryName, industryName);
        
        if (initiativeIds.length === 0) {
          setInitiatives([]);
          return;
        }
        
        // 根据 IDs 获取具体的 initiatives 数据
        const initiativesData = await getInitiativesByIds(initiativeIds);
        setInitiatives(initiativesData);
      } catch (err) {
        console.error('Failed to fetch initiatives:', err);
        setError('Failed to load initiatives data');
      } finally {
        setLoading(false);
      }
    };

    if (countryName && industryName) {
      fetchInitiatives();
    }
  }, [countryName, industryName]);

  // 加载状态
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 714.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 713.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 710 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
            <p className="text-gray-600 mt-1">Industry standards and certification programs</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading initiatives...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
            <p className="text-gray-600 mt-1">Industry standards and certification programs</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // 无数据状态
  if (initiatives.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
            <p className="text-gray-600 mt-1">Industry standards and certification programs</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">No relevant initiatives found for this country and industry combination.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">Industry standards and certification programs</p>
        </div>
      </div>

      {/* 标签和指南卡片列表 */}
      <div className="space-y-6">
        {initiatives.map((initiative) => (
          <div key={initiative.id} className="group bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo区域 */}
              <div className="flex-shrink-0 w-full md:w-48 flex justify-center md:justify-start">
                <div className="w-32 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-4 group-hover:bg-gray-100 transition-colors">
                  {initiative.logo ? (
                    <img
                      src={initiative.logo}
                      alt={`${initiative.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-cyan-600 to-blue-600 rounded-full"></div>
                  <h3 className="text-2xl font-light text-gray-900 group-hover:text-gray-700 transition-colors">
                    {initiative.name}
                  </h3>
                </div>
                <div 
                  className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: initiative.intro_html || initiative.intro }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
