export interface DailyTopicSeed {
  id: string;
  title: string;
  emoji: string;
  hook: string;
}

export const DAILY_TOPICS: DailyTopicSeed[] = [
  { id: "honeycomb", title: "なぜ蜂の巣は六角形なの？", emoji: "🐝", hook: "最小の材料で最大の面積を作る最強の形" },
  { id: "fibonacci", title: "ひまわりの種に隠れた魔法の数列", emoji: "🌻", hook: "螺旋の本数を数えると黄金比が現れる" },
  { id: "pi", title: "πはいつから3.14...だったの？", emoji: "🥧", hook: "古代エジプトから今も計算され続ける数" },
  { id: "fourier", title: "音楽はぜんぶ数学でできてる", emoji: "🎵", hook: "和音の美しさには整数比の秘密が" },
  { id: "fractal", title: "海岸線の長さは測れない？", emoji: "🌊", hook: "ズームすると無限に長くなる図形の世界" },
  { id: "infinity", title: "無限にも大きさの違いがある", emoji: "♾️", hook: "自然数より実数のほうが「多い」って証明できる" },
  { id: "primes", title: "素数はネットの安全を守ってる", emoji: "🔐", hook: "君の通信暗号は巨大な素数のおかげ" },
  { id: "monty", title: "ドアは変えるべき？モンティホール問題", emoji: "🚪", hook: "直感が裏切られる確率の罠" },
  { id: "goldenratio", title: "iPhoneも美術品も同じ比率？", emoji: "📱", hook: "1:1.618 の謎の魅力" },
  { id: "graph", title: "あの人と君は何人離れている？", emoji: "🌐", hook: "六次の隔たりを数学で語る" },
  { id: "topology", title: "ドーナツとマグカップは同じ形", emoji: "🍩", hook: "穴の数だけが本質、トポロジーの世界" },
  { id: "p_vs_np", title: "1億円の数学問題、P vs NP", emoji: "💰", hook: "解決したら暗号もAIもひっくり返る" },
  { id: "zero", title: "ゼロは発明品だった", emoji: "0️⃣", hook: "古代の人は『無』を数として書けなかった" },
  { id: "imaginary", title: "存在しない数 i がスマホを動かす", emoji: "⚡", hook: "虚数は虚しくない、電気と物理の必需品" },
  { id: "game_theory", title: "ジャンケンに最強戦略はあるか", emoji: "✊", hook: "ナッシュ均衡で勝率を語る" },
  { id: "chaos", title: "蝶の羽ばたきが台風を起こす", emoji: "🦋", hook: "カオス理論の奇妙な世界" },
  { id: "four_color", title: "どんな地図も4色で塗り分けられる", emoji: "🗺️", hook: "コンピューターが証明した有名問題" },
  { id: "fermat", title: "300年解けなかった謎、フェルマー", emoji: "📚", hook: "本の余白から始まった伝説" },
  { id: "sphere_packing", title: "オレンジを最も多く詰める方法", emoji: "🍊", hook: "ケプラー予想と球の最密充填" },
  { id: "benford", title: "数字の最初は1が多い、ベンフォードの法則", emoji: "🔢", hook: "脱税の発見にも使われる不思議な法則" },
];

export interface InterestSeed {
  id: string;
  label: string;
  emoji: string;
}

export const INTERESTS: InterestSeed[] = [
  { id: "music", label: "音楽", emoji: "🎵" },
  { id: "game", label: "ゲーム", emoji: "🎮" },
  { id: "sports", label: "スポーツ", emoji: "⚽" },
  { id: "cooking", label: "料理", emoji: "🍳" },
  { id: "anime", label: "アニメ/マンガ", emoji: "🎨" },
  { id: "fashion", label: "ファッション", emoji: "👗" },
  { id: "movie", label: "映画", emoji: "🎬" },
  { id: "space", label: "宇宙", emoji: "🌌" },
  { id: "nature", label: "自然", emoji: "🌳" },
  { id: "architecture", label: "建築", emoji: "🏛️" },
  { id: "history", label: "歴史", emoji: "📜" },
  { id: "tech", label: "テクノロジー", emoji: "💻" },
  { id: "psychology", label: "心理", emoji: "🧠" },
  { id: "economy", label: "お金", emoji: "💴" },
  { id: "animals", label: "動物", emoji: "🐾" },
];

/** 日付からトピックを決定（毎日違うが同日は全ユーザー同じ） */
export function getTodayTopic(date: Date = new Date()): DailyTopicSeed {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_TOPICS[dayOfYear % DAILY_TOPICS.length];
}

/** ランダムに別のトピック（現在のものを除く） */
export function getRandomTopic(currentId?: string): DailyTopicSeed {
  const pool = currentId
    ? DAILY_TOPICS.filter((t) => t.id !== currentId)
    : DAILY_TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}
