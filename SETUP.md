# MyBoss Setup Guide

完整的项目设置指南。

## 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号
- OpenAI API 密钥

## 详细设置步骤

### 1. 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd my_boss

# 安装依赖
npm install
```

### 2. Supabase 设置

#### 2.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息并创建

#### 2.2 执行数据库迁移

1. 进入项目 Dashboard
2. 点击左侧菜单的 "SQL Editor"
3. 点击 "New query"
4. 复制 `supabase/migrations/001_initial_schema.sql` 的全部内容
5. 粘贴到编辑器并点击 "Run"
6. 重复步骤3-5，执行 `supabase/migrations/002_seed_questions.sql`

#### 2.3 获取API密钥

1. 点击左侧菜单的 "Project Settings"
2. 点击 "API"
3. 复制以下信息：
   - Project URL (类似: `https://xxx.supabase.co`)
   - `anon` `public` key (用于客户端)

### 3. OpenAI API 设置

1. 访问 [https://platform.openai.com](https://platform.openai.com)
2. 登录并进入 API Keys 页面
3. 创建新的 API Key
4. 复制并保存（只显示一次）

### 4. 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# Supabase配置（从Step 2.3获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# OpenAI配置（从Step 3获取）
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 验证设置

### 检查数据库

在 Supabase SQL Editor 中运行：

```sql
-- 检查questions表（应该有50条记录）
SELECT dimension, COUNT(*) as count
FROM questions
GROUP BY dimension
ORDER BY dimension;

-- 应该返回每个维度10条记录
```

### 测试应用

1. 访问首页 - 应该看到 "已有 0 位打工人完成检测"
2. 点击"开始检测" - 应该进入第一题
3. 完成5题问卷 - 应该看到结果页面
4. 检查AI评价是否生成

## 常见问题

### Q1: 数据库连接失败

**症状**: 页面显示 "Error loading questions"

**解决**:
1. 检查 `.env.local` 中的 Supabase URL 和 Key
2. 确认已执行数据库迁移
3. 在 Supabase Dashboard 检查 Row Level Security (RLS) 策略

### Q2: AI评价不显示

**症状**: 结果页面其他都正常，但AI评价显示错误信息

**解决**:
1. 检查 `OPENAI_API_KEY` 是否正确
2. 确认 OpenAI 账户有余额
3. 检查服务器日志是否有 API 错误

### Q3: 图片下载失败

**症状**: 点击下载按钮没反应或报错

**解决**:
1. 检查浏览器控制台是否有错误
2. 尝试清除浏览器缓存
3. 使用最新版本的Chrome/Safari浏览器

### Q4: 问卷页面跳转异常

**症状**: 点击"下一题"后参数丢失

**解决**:
1. 清除浏览器缓存
2. 重新开始问卷
3. 检查 URL 中是否包含 `questions` 和 `answers` 参数

## 数据库表结构

### questions (题库)
- `id`: UUID
- `content`: 题目内容
- `dimension`: 维度枚举 (business/leadership/communication/accountability/care)
- `created_at`: 创建时间

### evaluations (评测结果)
- `id`: UUID
- `boss_identifier`: 老板标识（可选）
- `total_score`: 总分 (0-100)
- `dimension_scores`: 各维度分数 (JSONB)
- `ai_evaluation`: AI评价文本
- `created_at`: 创建时间

### evaluation_answers (答题记录)
- `id`: UUID
- `evaluation_id`: 关联的评测ID
- `question_id`: 问题ID
- `answer`: 答案 (yes/no/unsure)
- `score`: 得分
- `created_at`: 创建时间

## 部署到生产环境

### Vercel 部署

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量（同.env.local）
4. 部署

### 环境变量配置

在 Vercel 项目设置中添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`

## 性能优化建议

1. **OpenAI API缓存**: 考虑缓存相似分数的AI评价
2. **图片优化**: 使用 Next.js Image 组件
3. **数据库索引**: 已在迁移文件中创建必要索引
4. **边缘函数**: 考虑使用 Vercel Edge Functions 提升响应速度

## 安全注意事项

1. **不要提交 `.env.local`** 到版本控制
2. **OpenAI API Key** 应该只在服务器端使用
3. **Supabase RLS** 已配置，允许匿名读写（根据需求可调整）
4. **输入验证**: 已实现基本验证，可根据需要加强

## 下一步

- 添加更多题目到题库
- 自定义AI评价的风格和语气
- 添加社交媒体分享功能
- 实现数据分析和统计功能
- 添加用户认证（如需要）

## 技术支持

如有问题，请查看：
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)
