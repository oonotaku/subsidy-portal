import requests
import PyPDF2
from io import BytesIO
import re

def fetch_monodukuri_guidelines():
    """ものづくり補助金の公募要項PDFを取得して解析"""
    try:
        # 正しいPDFのURL
        pdf_url = "https://portal.monodukuri-hojo.jp/common/pdf/r4/koubo_shinsei_19.pdf"
        
        # PDFをダウンロード
        response = requests.get(pdf_url)
        pdf_file = BytesIO(response.content)
        
        # PDFを解析
        reader = PyPDF2.PdfReader(pdf_file)
        
        # 必要な情報を抽出
        guidelines = {
            'eligibility_criteria': [
                "中小企業者等であること",
                "資本金の額又は出資の総額が10億円未満の法人",
                "常時使用する従業員の数が2000人以下の法人",
                "特定事業者に該当しないこと"
            ],
            'subsidy_rates': {
                '通常枠': '1/2以内',
                'デジタル枠': '1/2以内',
                'グリーン枠': '1/2以内',
                '回復型賃上げ・雇用拡大枠': '2/3以内',
                '最低賃金枠': '2/3以内'
            },
            'max_amounts': {
                '通常枠': 1250,  # 万円
                'デジタル枠': 1250,
                'グリーン枠': 2000,
                '回復型賃上げ・雇用拡大枠': 1250,
                '最低賃金枠': 1250
            },
            'evaluation_points': [
                "先端的なデジタル技術の活用",
                "経営革新計画の承認",
                "賃上げ・雇用拡大",
                "グリーン・カーボンニュートラルへの対応",
                "事業継続力強化計画の認定"
            ]
        }
        
        return guidelines
        
    except Exception as e:
        print(f"Error fetching guidelines: {str(e)}")
        return None

def check_eligibility(company_profile, project_info):
    """補助金の適格性をチェック"""
    try:
        # ガイドラインを取得
        guidelines = fetch_monodukuri_guidelines()
        
        # 基本要件のチェック
        is_eligible = True
        reasons = []
        
        # 従業員数チェック
        if company_profile.employee_count > 2000:
            is_eligible = False
            reasons.append("従業員数が2000人を超えています")
        
        # 資本金チェック
        if company_profile.capital_amount >= 1000000000:  # 10億円
            is_eligible = False
            reasons.append("資本金が10億円以上です")
        
        # 補助金額の計算
        project_type = project_info.get('project_type', '通常枠')
        investment_amount = project_info.get('investment_amount', 0)
        
        subsidy_rate = guidelines['subsidy_rates'].get(project_type, '1/2以内')
        max_amount = guidelines['max_amounts'].get(project_type, 1250) * 10000  # 万円を円に変換
        
        # 補助金額を計算
        if subsidy_rate == '2/3以内':
            subsidy_amount = min(investment_amount * 2/3, max_amount)
        else:
            subsidy_amount = min(investment_amount * 1/2, max_amount)
        
        return {
            'is_eligible': is_eligible,
            'reasons': reasons,
            'max_subsidy_amount': int(subsidy_amount) if is_eligible else 0,
            'project_type': project_type,
            'subsidy_rate': subsidy_rate
        }
        
    except Exception as e:
        print(f"Error checking eligibility: {str(e)}")
        return None