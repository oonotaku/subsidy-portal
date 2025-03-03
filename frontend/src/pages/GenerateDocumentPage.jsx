import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const GenerateDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [documentContent, setDocumentContent] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch project data');
      
      const data = await response.json();
      setProjectData(data);
      
      // プロジェクトがAI質問完了状態でない場合はリダイレクト
      if (data.status !== 'AI質問完了' && data.status !== '事業計画書完成') {
        toast.error('このプロジェクトは事業計画書生成の準備ができていません');
        navigate('/project-plans');
        return;
      }
      
      setLoading(false);
      
      // 事業計画書が既に生成済みの場合は取得
      if (data.status === '事業計画書完成') {
        fetchDocument();
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('プロジェクトデータの取得に失敗しました');
      setLoading(false);
    }
  };

  const fetchDocument = async () => {
    // 実際のAPIから事業計画書を取得する処理
    // ここではダミーデータを使用
    setDocumentContent(`
# 事業計画書

## 1. 事業概要
${projectData?.title || '事業計画書'}は、革新的なサービスを提供します。

## 2. 市場分析
市場規模は年間約1000億円で、年率10%で成長しています。

## 3. 競合分析
主な競合他社はA社、B社ですが、当社の強みは...

## 4. 収益モデル
初期投資額は500万円で、3年目に黒字化を目指します。

## 5. マーケティング戦略
SNSを活用した認知度向上と、業界イベントへの参加を通じて...

## 6. 実施スケジュール
1年目: 製品開発とベータ版リリース
2年目: 本格展開と顧客基盤の拡大
3年目: 収益化と事業拡大
    `);
  };

  const generateDocument = async () => {
    setGenerating(true);
    try {
      // 実際のAPIを呼び出して事業計画書を生成
      // ここではダミーデータを使用
      await new Promise(resolve => setTimeout(resolve, 2000)); // 生成を模擬
      
      setDocumentContent(`
# 事業計画書

## 1. 事業概要
${projectData?.title || '事業計画書'}は、革新的なサービスを提供します。

## 2. 市場分析
市場規模は年間約1000億円で、年率10%で成長しています。

## 3. 競合分析
主な競合他社はA社、B社ですが、当社の強みは...

## 4. 収益モデル
初期投資額は500万円で、3年目に黒字化を目指します。

## 5. マーケティング戦略
SNSを活用した認知度向上と、業界イベントへの参加を通じて...

## 6. 実施スケジュール
1年目: 製品開発とベータ版リリース
2年目: 本格展開と顧客基盤の拡大
3年目: 収益化と事業拡大
      `);
      
      toast.success('事業計画書を生成しました');
      
      // プロジェクトのステータスを更新（実際のAPIでは必要）
      setProjectData(prev => ({ ...prev, status: '事業計画書完成' }));
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('事業計画書の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const downloadDocument = () => {
    // Markdownをテキストファイルとしてダウンロード
    const element = document.createElement('a');
    const file = new Blob([documentContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${projectData?.title || '事業計画書'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <Link to="/project-plans" className="text-blue-600 hover:text-blue-800">
          ← プロジェクト一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold mt-4">{projectData.title || `事業計画書 #${id}`}</h1>
      </div>

      {!documentContent ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">事業計画書の生成</h2>
          <p className="mb-6">
            基本質問とAI質問への回答をもとに、事業計画書を自動生成します。
            生成された事業計画書は、必要に応じて編集することができます。
          </p>

          <button
            onClick={generateDocument}
            disabled={generating}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {generating ? '生成中...' : '事業計画書を生成する'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">事業計画書</h2>
              <button
                onClick={downloadDocument}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ダウンロード
              </button>
            </div>
            
            <div className="prose max-w-none border p-4 rounded bg-gray-50">
              <pre className="whitespace-pre-wrap">{documentContent}</pre>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">次のステップ</h2>
            <p className="mb-4">
              生成された事業計画書は、実際のビジネスプランニングの出発点として活用できます。
              以下のような用途に役立てることができます：
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>投資家や金融機関へのプレゼンテーション資料</li>
              <li>社内での事業計画の共有</li>
              <li>補助金・助成金の申請書類の基礎資料</li>
              <li>事業の方向性を明確化するための指針</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateDocumentPage; 