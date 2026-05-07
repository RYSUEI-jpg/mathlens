import { Grade, Verbosity, GRADE_LABEL } from "./types";

/**
 * 読み取りだけを行う軽量プロンプト。
 * 解説確認モーダルを表示する場合の最初のステップで使用。
 * 解説生成しないので速く、APIコストも安い。
 */
export function buildReadOnlyPrompt(): string {
  return `画像から数学の問題を読み取って、JSON形式で返してください。
**解説や答えは不要、読み取りだけ**を行ってください。

# 出力フォーマット
{
  "problems": [
    { "problemReading": "問題の内容（数式は$...$または$$...$$でLaTeX）" }
  ]
}

# ルール
- 画像内の問題が1つでも、配列の要素として返す
- 複数の問題がある場合は別オブジェクトとして配列に並べる（例: 3問あれば配列の長さ3）
- 数学の問題が認識できない場合: { "problems": [{ "problemReading": "数学の問題が認識できませんでした" }] }
- LaTeXのバックスラッシュは \\\\\\\\ とエスケープ
- approach, steps, answer, diagram などのフィールドは含めないでください`;
}

const VERBOSITY_INSTRUCTION: Record<Verbosity, string> = {
  brief: "要点だけを簡潔に説明してください。冗長な説明は避けます。",
  standard: "標準的な詳しさで、つまずきやすいポイントには補足を入れてください。",
  detailed: "非常に詳しく、各ステップの根拠・なぜそうなるのかを丁寧に説明してください。",
};

/**
 * 追加質問（フォローアップ）用プロンプト。
 * 既存の解説内容と過去の会話履歴を踏まえて、新しい質問に答える。
 * 短い回答を意図し、JSON配列に1要素だけ返す。
 */
export function buildFollowUpPrompt(
  context: string,
  history: Array<{ role: string; content: string }>,
  question: string,
  grade: Grade,
  verbosity: Verbosity
): string {
  const historyBlock = history
    .map((m) => `${m.role === "user" ? "ユーザー" : "AI"}: ${m.content}`)
    .join("\n");
  return `あなたは数学の家庭教師です。先ほど以下の解説をしました:

# 元の解説
"""
${context}
"""

${historyBlock ? `# 過去の追加質問\n"""\n${historyBlock}\n"""\n\n` : ""}# ユーザーからの追加質問
"""
${question}
"""

${GRADE_LABEL[grade]}向けに、上記の追加質問に答えてください。${VERBOSITY_INSTRUCTION[verbosity]}

# 出力フォーマット
必ず以下のJSON構造のみで回答してください（プレーンテキストやコードブロックは禁止）:

{
  "problems": [
    {
      "problemReading": "（追加質問への答え）",
      "approach": "",
      "steps": "",
      "answer": ""
    }
  ]
}

- 答えは "problemReading" フィールドにすべて入れてください（マークダウン可、数式はLaTeX）
- LaTeXのバックスラッシュは \\\\\\\\ とエスケープ
- 短く・端的に答える（追加質問なので長文不要）`;
}

/**
 * テキスト入力用プロンプト。
 * 問題解決型「x²-5x+6=0を解いて」と概念説明型「微分について教えて」の両方に対応。
 */
export function buildTextPrompt(
  question: string,
  grade: Grade,
  verbosity: Verbosity
): string {
  return `あなたは優秀な数学の家庭教師です。以下のユーザーからの質問に${GRADE_LABEL[grade]}向けに答えてください。

# ユーザーの質問
"""
${question}
"""

# 対象レベル
${GRADE_LABEL[grade]}が理解できる用語・公式の範囲で説明してください。難しすぎる解法は避けます。

# 解説の詳しさ
${VERBOSITY_INSTRUCTION[verbosity]}

# 出力フォーマット
必ず以下のJSON構造のみで回答してください。コードブロックや前置き・後書きは一切不要です。

{
  "problems": [
    {
      "problemReading": "ユーザーの質問の要約・整形",
      "diagram": "<svg>...</svg>",
      "approach": "概要・方針（マークダウン可、数式はLaTeX）",
      "steps": "具体的な説明・解法ステップ（マークダウン可、数式はLaTeX）",
      "answer": "答えまたは要点まとめ（数式はLaTeX）"
    }
  ]
}

# 質問の種類による使い分け

## 問題解決型（例: 「2x+5=13を解いて」「半径3の円の面積は？」）
- problemReading: 問題そのものを整形して書く
- approach: 解法の方針
- steps: 計算ステップ（番号付きリスト）
- answer: 最終的な答え

## 概念説明型（例: 「微分について教えて」「三角関数の加法定理とは？」）
- problemReading: 質問を整形（例: 「微分について」）
- approach: 概念の概要・直感的理解
- steps: 詳細説明と具体例（複数）
- answer: 要点まとめ・覚えるべきポイント

# 重要なルール

## 配列について
- **必ず "problems" 配列の要素として1つ返す**（複数質問されても基本は1つ）

## diagram フィールド（図解）について
- **図があると理解しやすい場合のみ** 含めてください。テキストだけで完結する場合は不要（フィールド省略）
- 図解が役立つ例: 幾何・座標平面・関数のグラフ・ベクトル・図形的概念
- SVG要件:
  * \`viewBox\` 属性を必ず指定（例: viewBox="0 0 400 300"）
  * **\`<script>\` タグや on* イベントハンドラは禁止**

### ⚠️ 関数グラフ・座標平面を描くときの最重要事項
**SVGのy軸はデフォルトで下向きが正です**。\`<g transform="translate(cx,cy) scale(s,-s)">\` で反転した座標系で曲線・点を描いてください。textはtransformの外に書く。曲線は20点以上のpolylineで滑らかに。

## LaTeX について
- バックスラッシュは \\\\\\\\ とエスケープ（例: "$\\\\\\\\frac{1}{2}$"）

## エラーケース
- 質問が数学に関係ない場合: { "problems": [{ "problemReading": "数学に関する質問にお答えします", "approach": "申し訳ありませんが、数学以外のご質問にはお答えできません。", "steps": "", "answer": "" }] }`;
}

export function buildPrompt(grade: Grade, verbosity: Verbosity): string {
  return `あなたは優秀な数学の家庭教師です。画像から数学の問題を読み取り、${GRADE_LABEL[grade]}向けに解説してください。

# 対象レベル
${GRADE_LABEL[grade]}が理解できる用語・公式の範囲で説明してください。難しすぎる解法は避けます。

# 解説の詳しさ
${VERBOSITY_INSTRUCTION[verbosity]}

# 出力フォーマット
必ず以下のJSON構造のみで回答してください。コードブロックや前置き・後書きは一切不要です。

{
  "problems": [
    {
      "problemReading": "問題の内容（数式は$...$または$$...$$でLaTeX）",
      "diagram": "<svg>...</svg>",
      "approach": "考え方・方針（マークダウン可、数式はLaTeX）",
      "steps": "解法ステップ（番号付きリスト推奨、数式はLaTeX）",
      "answer": "最終答え（数式はLaTeX）"
    }
  ]
}

# 重要なルール

## 配列について
- **画像内の問題が1つでも、必ず "problems" 配列の要素として返す**
- 複数の問題がある場合は、それぞれを別オブジェクトとして配列に並べる

## diagram フィールド（図解）について
- **図があると理解しやすい問題のみ** 含めてください。テキストだけで完結する代数問題（例: 一次方程式 2x+5=13）には不要です（フィールド自体を省略）
- 図解が役立つ問題の例:
  * 幾何（三角形・円・角度など）
  * 座標平面・関数のグラフ（放物線・直線の交点など）
  * 微積分（関数の概形・接線・極値）
  * ベクトル・図形の位置関係
- SVG要件:
  * \`viewBox\` 属性を必ず指定（例: viewBox="0 0 400 300"）
  * 幅・高さ属性は不要（CSS側で制御）
  * 色は \`stroke="#4f46e5"\` などインラインで指定。背景白前提
  * テキストは日本語OK（fontSize 12-14推奨）
  * **\`<script>\` タグや on* イベントハンドラは禁止**（セキュリティ）

## ⚠️ 関数グラフ・座標平面を描くときの最重要事項

**SVGのy軸はデフォルトで下向きが正です**（普通の数学グラフと逆）。
これを失敗するとグラフが上下反転して意味不明になります。**必ず以下の方法を使ってください**:

### 方法: transformグループで座標系を反転
\`\`\`svg
<svg viewBox="0 0 400 300">
  <!-- 1) グリッド・軸・軸ラベルはSVGの素の座標で描く -->
  <line x1="0" y1="150" x2="400" y2="150" stroke="#cbd5e1" stroke-width="1"/> <!-- x軸 -->
  <line x1="200" y1="0" x2="200" y2="300" stroke="#cbd5e1" stroke-width="1"/> <!-- y軸 -->
  <text x="385" y="145" font-size="12" fill="#64748b">x</text>
  <text x="205" y="15" font-size="12" fill="#64748b">y</text>
  <!-- 軸の数字。y軸の数字は上が正、下が負になるよう配置 -->
  <text x="240" y="145" font-size="11" fill="#64748b">1</text>  <!-- x=1 -->
  <text x="205" y="115" font-size="11" fill="#64748b">1</text>  <!-- y=1 (上) -->
  <text x="205" y="180" font-size="11" fill="#64748b">-1</text> <!-- y=-1 (下) -->

  <!-- 2) 関数の曲線・点・矢印などはtransformで反転した座標系で描く -->
  <g transform="translate(200,150) scale(40,-40)" stroke="#e11d48" stroke-width="0.06" fill="none">
    <!-- ここではmath座標: 原点(0,0)、xは右が正、yは上が正、1単位=40px -->
    <!-- 関数を点列で描く（20〜40点をsmooth: polyline か path） -->
    <polyline points="-1.5,-3.375 -1,-2 -0.5,-0.625 0,0 0.5,0.125 1,1 1.5,3.375"/>
    <!-- 極値の点 -->
    <circle cx="0" cy="0" r="0.1" fill="#10b981"/>
  </g>
  <!-- 点のラベルはSVGネイティブ座標で配置（transform内でtextを書くと反転して読めない） -->
  <text x="210" y="145" font-size="11" fill="#10b981">極大値 (0,0)</text>
</svg>
\`\`\`

### グラフ描画の必須事項
1. **y軸の数字ラベル: 上に正の値、下に負の値**を配置（標準的な数学グラフ向き）
2. **曲線は20点以上**でpolylineかpath。少ないとカクカクして関数に見えない
3. **textは <g transform> の外**に書く（中に書くと文字も反転して読めない）
4. **極値・特徴点には circle と text** を添えてラベル付け
5. 縦横比は \`scale(40,-40)\` のように同じ絶対値（歪み防止）

- JSON文字列内ではダブルクォートを \\\\" でエスケープ

## LaTeX について
- バックスラッシュは \\\\\\\\ とエスケープ（例: "$\\\\\\\\frac{1}{2}$"）

## エラーケース
- 数学の問題が認識できない場合: { "problems": [{ "problemReading": "数学の問題が認識できませんでした", "approach": "", "steps": "", "answer": "" }] }

## その他
- 答えに複数解がある場合はすべて記載`;
}
