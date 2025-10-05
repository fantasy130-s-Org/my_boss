-- Seed 50 questions across 5 dimensions (10 questions per dimension)
-- All questions are negatively phrased (negative descriptions of boss behavior)

-- Business capability questions (业务水平) - 10 questions
INSERT INTO questions (content, dimension) VALUES
('老板经常对业务细节一问三不知', 'business'),
('老板做决策时缺乏数据支撑，全凭感觉', 'business'),
('老板不了解行业趋势和竞争对手情况', 'business'),
('老板制定的目标经常不切实际', 'business'),
('老板不懂产品，却喜欢指手画脚', 'business'),
('老板的商业判断经常出现重大失误', 'business'),
('老板缺乏长期战略规划', 'business'),
('老板不重视产品质量，只看短期利益', 'business'),
('老板对市场变化反应迟钝', 'business'),
('老板的业务决策经常朝令夕改', 'business');

-- Leadership/Command questions (指挥水平) - 10 questions
INSERT INTO questions (content, dimension) VALUES
('老板布置任务时语焉不详，目标不清晰', 'leadership'),
('老板经常临时改变优先级，打乱工作计划', 'leadership'),
('老板不会合理分配任务，总是让同样的人加班', 'leadership'),
('老板喜欢越级指挥，破坏团队管理秩序', 'leadership'),
('老板缺乏决断力，关键时刻犹豫不决', 'leadership'),
('老板不信任下属，什么都要亲自过问', 'leadership'),
('老板经常在会议上批评下属，却不给建设性意见', 'leadership'),
('老板不懂授权，大小事情都要自己审批', 'leadership'),
('老板制定的工作流程混乱低效', 'leadership'),
('老板经常给出互相矛盾的指示', 'leadership');

-- Communication questions (沟通水平) - 10 questions
INSERT INTO questions (content, dimension) VALUES
('老板从不主动与员工沟通工作进展', 'communication'),
('老板在会议上经常跑题，浪费大家时间', 'communication'),
('老板听不进反对意见，独断专行', 'communication'),
('老板传达信息时经常遗漏关键内容', 'communication'),
('老板喜欢在微信群里半夜发工作消息', 'communication'),
('老板说话不算数，承诺的事情经常不兑现', 'communication'),
('老板从不给予及时的工作反馈', 'communication'),
('老板喜欢用命令式语气，不尊重员工', 'communication'),
('老板表达不清，导致团队经常理解错误', 'communication'),
('老板只会批评，从不表扬员工的成绩', 'communication');

-- Accountability questions (背锅水平) - 10 questions
INSERT INTO questions (content, dimension) VALUES
('项目失败时，老板总是把责任推给下属', 'accountability'),
('老板从不承认自己的决策失误', 'accountability'),
('出了问题老板第一反应是找人背锅', 'accountability'),
('老板会在客户面前甩锅给员工', 'accountability'),
('老板的失误导致损失，却让团队承担后果', 'accountability'),
('老板在上级面前把功劳揽到自己身上', 'accountability'),
('老板不敢在高层面前为团队争取资源', 'accountability'),
('团队加班熬夜的成果，老板说成是自己的功劳', 'accountability'),
('老板遇到困难就逃避，把问题扔给下属', 'accountability'),
('老板从不为团队的辛苦付出发声', 'accountability');

-- Care/Concern questions (关怀水平) - 10 questions
INSERT INTO questions (content, dimension) VALUES
('老板从不关心员工的身体健康状况', 'care'),
('老板认为加班是理所当然的', 'care'),
('老板不尊重员工的个人时间', 'care'),
('老板从不考虑员工的职业发展', 'care'),
('老板对员工的家庭情况毫不关心', 'care'),
('老板画大饼，从不给实际的涨薪升职', 'care'),
('员工生病请假，老板表现出明显不满', 'care'),
('老板从不组织团建活动，也不关心团队氛围', 'care'),
('老板只在乎业绩，把员工当成工具', 'care'),
('老板从不为员工提供学习和培训机会', 'care');
