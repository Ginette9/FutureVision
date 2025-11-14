import React, { useMemo } from 'react';
import industryTreeData from '@/locales/industries.json';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProductId } from '@/lib/utils';

type IndustryNode = {
  title?: string;
  children?: IndustryNode[];
};

interface IndustryTreeSelectProps {
  searchTerm: string;
  onSelect: (id: string, label: string) => void;
  selectedId?: string;
}

// 确保从 t() 读取到字符串数组
const ensureArray = (val: string | string[]): string[] => {
  if (Array.isArray(val)) return val as string[];
  try {
    const parsed = JSON.parse(String(val));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// 根据当前语言将英文标题映射为本地化标题
const useLocalizedMapper = () => {
  const { language, t } = useLanguage();
  const enList = useMemo(() => ensureArray(t('industries')), [t]);
  const zhListRaw = useMemo(() => ensureArray(t('industries.zh')), [t]);
  const isZh = language === 'zh-CN' || language === 'zh-HK';
  const zhList = isZh && zhListRaw.length === enList.length ? zhListRaw : [];

  const getLabel = (englishTitle: string) => {
    const idx = enList.findIndex((e) => e === englishTitle);
    if (isZh && zhList.length === enList.length && idx >= 0) {
      return zhList[idx];
    }
    return englishTitle;
  };

  return { getLabel, enList };
};

// 始终展开的分级列表，所有层级均可选
export const IndustryTreeSelect: React.FC<IndustryTreeSelectProps> = ({ searchTerm, onSelect, selectedId }) => {
  const { getLabel } = useLocalizedMapper();

  const normalizedQuery = (searchTerm || '').trim().toLowerCase();

  const computeId = (englishTitle: string) => getProductId(englishTitle);

  // 递归渲染树（无搜索，始终展开）
  const renderTree = (nodes: IndustryNode[], level = 0) => {
    return nodes.map((node, idx) => {
      const title = node.title || '';
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const englishTitle = title;
      const localLabel = title ? getLabel(title) : '';
      const key = `${englishTitle}-${level}-${idx}`;

      if (!title && !hasChildren) return null;

      const id = englishTitle ? computeId(englishTitle) : '';
      const isSelected = selectedId && id && selectedId === id;
      // 统一层级缩进：一级 pl-4，二级 pl-8，三级及以下 pl-12
      const indentClass = level >= 2 ? 'pl-12' : level === 1 ? 'pl-8' : 'pl-4';
      const weightClass = level === 0 ? 'font-semibold text-gray-900' : level === 1 ? 'font-medium text-gray-800' : 'text-gray-800';
      const underlineClass = level >= 2 ? 'hover:underline' : '';

      const baseButton = (
        <button
          key={key}
          type="button"
          onClick={() => englishTitle && id && onSelect(id, localLabel || englishTitle)}
          className={`w-full ${indentClass} px-4 py-2 text-left transition-colors ${underlineClass} ${
            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <span className={`${weightClass}`}>{localLabel || englishTitle}</span>
        </button>
      );

      // 顶层项后添加分隔线
      if (hasChildren) {
        return (
          <div key={key}>
            {baseButton}
            <div className={`pl-0`}>{renderTree(node.children || [], level + 1)}</div>
            {level === 0 && (
              <div className="border-t border-gray-200 my-3" />
            )}
          </div>
        );
      }

      return baseButton;
    });
  };

  // 搜索匹配：展示所有层级节点，并显示路径
  type FlatNode = { id: string; englishTitle: string; path: string[] };
  const flatNodes: FlatNode[] = useMemo(() => {
    const out: FlatNode[] = [];
    const dfs = (nodes: IndustryNode[], path: string[]) => {
      nodes.forEach((node) => {
        const title = node.title || '';
        const nextPath = title ? [...path, title] : path;
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        if (title) {
          out.push({ id: getProductId(title), englishTitle: title, path: nextPath });
        }
        if (hasChildren) {
          dfs(node.children!, nextPath);
        }
      });
    };
    dfs(industryTreeData as IndustryNode[], []);
    return out;
  }, []);

  const filteredNodes = useMemo(() => {
    if (!normalizedQuery) return flatNodes;
    const q = normalizedQuery;
    return flatNodes.filter((node) => {
      const localLabel = getLabel(node.englishTitle);
      return (
        node.englishTitle.toLowerCase().includes(q) || localLabel.toLowerCase().includes(q) || node.path.join(' / ').toLowerCase().includes(q)
      );
    });
  }, [normalizedQuery, flatNodes, getLabel]);

  if (!Array.isArray(industryTreeData)) return null;

  // 如果查询存在，渲染匹配的叶子列表（每项展示路径）
  if (normalizedQuery) {
    return (
      <div className="py-2">
        {filteredNodes.map((node, idx) => {
          const localLabel = getLabel(node.englishTitle);
          const pathLocalized = node.path.map(getLabel).join(' / ');
          const isSelected = selectedId && selectedId === node.id;
          return (
            <button
              key={`${node.id || 'noid'}-${idx}`}
              type="button"
              onClick={() => node.id && onSelect(node.id, localLabel)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                isSelected ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-gray-900">{localLabel}</div>
              <div className="text-xs text-gray-500">{pathLocalized}</div>
            </button>
          );
        })}
      </div>
    );
  }

  // 默认渲染树（始终展开，每个一级行业之间加入分隔线）
  return <div className="py-2">{renderTree((industryTreeData as IndustryNode[]) || [], 0)}</div>;
};

export default IndustryTreeSelect;