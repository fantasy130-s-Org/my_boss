# MyBoss (我的老板)

一个幽默风趣的老板水平检测平台，让打工人可以匿名评价老板，吐槽职场，获得情绪价值。

## 功能特点

- 📝 **5题快速检测** - 从50题题库中随机抽取5题，每题对应一个维度
- 🤖 **AI智能评价** - 使用GPT-4o-mini生成幽默风趣的老板评价
- 📊 **五维雷达图** - 业务、指挥、沟通、背锅、关怀五个维度全方位评估
- 🏆 **全国排名** - 看看你的老板打败了全国多少老板
- 🔍 **老板搜索** - 搜索查看别人对同一老板的评价
- 📥 **图片分享** - 下载结果图片，分享到社交网络

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui
- **图表**: Recharts
- **AI**: OpenAI GPT-4o-mini
- **语言**: TypeScript

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd my_boss
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. 设置数据库

1. 在 [Supabase](https://supabase.com) 创建项目
2. 进入 SQL Editor
3. 依次执行以下SQL文件：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_questions.sql`

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
my_boss/
├── app/
│   ├── page.tsx                    # 首页
│   ├── questionnaire/[step]/       # 问卷页面（5步）
│   ├── results/                    # 结果页面
│   ├── search/                     # 搜索页面
│   └── api/                        # API路由
├── components/
│   ├── QuestionnaireForm.tsx       # 问卷表单组件
│   ├── ResultsDisplay.tsx          # 结果展示组件
│   └── BossRadarChart.tsx          # 雷达图组件
├── lib/
│   ├── openai.ts                   # OpenAI集成
│   └── scoring.ts                  # 评分算法
├── types/
│   └── database.ts                 # 数据库类型定义
├── utils/
│   └── supabase/                   # Supabase客户端配置
└── supabase/
    └── migrations/                 # 数据库迁移文件
```

## 评分规则

- **是**: 0分（老板有这个问题）
- **否**: 15-20分随机（老板没这个问题）
- **难说**: 5-10分随机（不确定）
- **总分**: 0-100分，分数越高老板越好

## 五维度说明

1. **业务水平** - 老板的业务能力和商业判断
2. **指挥水平** - 老板的管理和决策能力
3. **沟通水平** - 老板的沟通效率和方式
4. **背锅水平** - 老板的责任担当意识
5. **关怀水平** - 老板对员工的关心程度

## 部署

### Vercel (推荐)

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

## 开发说明

- 所有页面都是移动优先响应式设计
- 问卷状态通过URL参数传递（无需登录）
- 支持匿名评价，可选填老板标识
- AI评价有容错处理，即使失败也不影响评分

## License

MIT

## 免责声明

本项目仅供娱乐，请勿对号入座。评价结果不代表真实的老板水平，仅供打工人放松心情使用。
