# DSH MemOS 记忆配置面板

**1.2.0 隐私筛选为预览版**，仅验证下表所列 Windows 环境，并要求 legacy Settings 兼容接口。请先核对兼容范围再安装。

为 **DeepSeek Harness（DSH）** 的官方 MemOS 云记忆插件提供中文设置界面，集中管理连接、召回、写入、知识库和请求参数。

这是独立维护的第三方面板，需要配合 [MemTensor 官方 DSH 插件](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin/tree/main/packages/dsh) 使用。1.2.0 使用固定 MemOS DSH 0.1.2 的兼容运行层承接召回和写回，在本机检查请求。官方包仍需安装，用于提供依赖；它的原始生命周期不会同时运行。

**配置入口：设置 → MemOS 记忆。** 插件详情页只展示插件信息。

[下载 1.2.0 预览版](https://github.com/lxl2000927/dsh-memos-panel/releases/tag/v1.2.0) · [反馈问题](https://github.com/lxl2000927/dsh-memos-panel/issues) · [官方 DSH 参数说明](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin/blob/main/packages/dsh/README.zh.md)

## 功能

- 完整展示官方 DSH 插件 **0.1.2 的 35 项配置**，另加 6 项本地隐私设置，共七组。
- 字段搜索、待保存筛选、分组展开/收起，支持窄窗口布局。
- 中文用途说明、字段名、默认/继承值、取值范围与关联条件。
- 逐项或按组恢复默认，JSON 格式化与填写示例。
- 批量保存前可检查和放弃草稿；通过宿主 Settings API 局部修改配置并检查版本冲突。
- API Key 输入留空会保留已有值；保存后不向浏览器回传已存密钥。
- 连接测试使用固定查询，只返回成功状态与耗时。

## 兼容范围

| 项目 | 当前状态 |
| --- | --- |
| 已验证环境 | Windows，DSH 桌面版 0.2.1-rc.3，官方 MemOS DSH 插件 0.1.2 |
| 已验证环境的特殊情况 | 宿主安装了 legacy Settings 兼容层；面板会使用同一命名空间的最后一份描述及版本号 |
| 包声明的 DSH 范围 | `>=0.2.1-rc.2 <0.3.0-0`，范围内其他版本仍需验证 |
| 源码打包/测试 | Node.js ≥24.9；运行时使用已安装官方插件的依赖 |
| 宿主需要提供 | Settings 的 `describe/mutate`、Web Server、Connection 校验，以及设置页扩展插槽 |
| 界面语言 | 中文；插件元信息提供中英文 |

DSH 正在快速迭代。包的版本范围不等于所有版本均已实测。1.2.0 的隐私适配层要求宿主提供已验证的 legacy Settings `register` 兼容接口；未经修改的官方宿主及其他系统尚未独立验证，缺少此接口时停止 MemOS 请求。此仓库不修改 DSH SDK 或官方插件安装文件，也不替换全局 fetch。面板的 bundle 禁用原始 `memos-cloud` 运行条目，加入 `memos-cloud-guard`，沿用原来的 `memos-cloud` Settings 命名空间与账号参数。仅支持官方插件 0.1.2；版本不符时停止适配层，不自动退回未过滤请求。

面板默认值依据 **DSH 插件 0.1.2**，OpenClaw 仅用于界面设计参考。OpenClaw 独有的二次模型过滤、每个 Agent 独立覆盖和整段会话采集不在此版本内。

## 安装

### DSH 桌面版

1. 先在 DSH 插件管理中安装并启用 `@memtensor/memos-cloud-dsh-plugin`；必须为 0.1.2；其他版本的运行层尚未适配。
2. 打开「插件 → 添加插件」，将下面的安装包直链填入「包名或地址」：

`https://github.com/lxl2000927/dsh-memos-panel/releases/download/v1.2.0/dsh-memos-panel-1.2.0.tgz`

3. 安装并启用面板后，完全退出并重新打开 DSH。
4. 在「设置 → MemOS 记忆」中填写或检查配置。

也可从 [1.2.0 Release](https://github.com/lxl2000927/dsh-memos-panel/releases/tag/v1.2.0) 下载 `.tgz`，在支持本地包的宿主中使用该包路径。Git 源安装可填写 `https://github.com/lxl2000927/dsh-memos-panel.git#v1.2.0`。

**本项目目前通过 GitHub 发布，未发布到 npm。** 仅输入 `dsh-memos-panel` 包名不能保证安装本项目，请使用上述链接。

### DSH Web Profile（尚未独立实测）

支持上述宿主接口的 Web Profile 可通过 CLI 添加同一个安装包：

```powershell
dsh plugin --profile web add "https://github.com/lxl2000927/dsh-memos-panel/releases/download/v1.2.0/dsh-memos-panel-1.2.0.tgz"
```

随后重启对应的 DSH Web 服务。桌面 Profile 由桌面应用管理，请使用桌面插件界面安装。

## 初次配置

1. 在 [MemOS Dashboard](https://memos-dashboard.openmem.net/cn/apikeys/) 创建 API Key。
2. 打开「设置 → MemOS 记忆 → 连接与鉴权」。
3. 输入 API Key，或沿用已有的 DSH 凭据/环境变量引用 `MEMOS_API_KEY`。
4. 设置稳定的用户 ID；跨设备使用同一个 ID 可访问同一用户域的记忆。该字段是记忆标识，无需填写登录密码。
5. 点击「测试连接」，检查后点击「保存配置」。连接测试可以使用未保存的表单输入，测试本身不会保存配置。

面板不会在安装或打开时自动将全部参数写成出厂值，也不会自动更改已有账号或密钥。只有点击保存后，手动修改的字段才会写入。

### 默认值与恢复默认

下表是 **官方 DSH 插件 0.1.2 的出厂默认值**。实际界面中的「默认」首先采用宿主提供的基础/继承配置，再回退到面板内置值。

「恢复默认」会移除所选字段的当前覆盖，回到宿主的继承值。宿主基础配置已有自定义值时，重置结果可能与出厂值不同。重置也需要点击保存才生效。API Key 不参与重置；对「连接与鉴权」执行整组重置时，用户 ID、服务地址和密钥引用名称会一同重置为继承值。

### 连接与鉴权

| 参数 | 用途 | 官方出厂默认值 |
| --- | --- | --- |
| `apiKey` | MemOS API Key | 未设置；可使用 DSH 凭据或环境变量 |
| `userId` | 账号 / 用户 ID | `MEMOS_USER_ID` → `deepseek-harness-user` |
| `apiKeyEnv` | 密钥引用名称 | `MEMOS_API_KEY` |
| `baseURL` | API 服务地址 | `https://memos.memtensor.cn/api/openmem/v1` |

### 会话与召回

| 参数 | 用途 | 官方出厂默认值 |
| --- | --- | --- |
| `recallEnabled` | 回答前检索记忆 | `true` |
| `recallGlobal` | 跨会话全局检索 | `false` |
| `memoryLimitNumber` | 事实记忆条数 | `6` |
| `relativity` | 最低相关性 | `0.45` |
| `includePreference` | 检索偏好记忆 | `true` |
| `preferenceLimitNumber` | 偏好记忆条数 | `6` |
| `includeToolMemory` | 检索并保存工具记忆 | `false` |
| `toolMemoryLimitNumber` | 工具记忆条数 | `6` |
| `maxQueryChars` | 检索输入字符上限 | `4000` |
| `maxItemChars` | 单条记忆字符上限 | `2000` |
| `maxRecallChars` | 注入记忆字符总上限 | `12000` |
| `queryPrefix` | 检索前缀 | 空字符串 |

### 写回与存储

| 参数 | 用途 | 官方出厂默认值 |
| --- | --- | --- |
| `addEnabled` | 对话完成后保存记忆 | `true` |
| `includeAssistant` | 保存助手的回答 | `true` |
| `includeSubagents` | 处理子智能体的会话 | `false` |
| `asyncMode` | 异步处理记忆写入 | `true` |
| `tags` | 写入标签 | `["deepseek-harness"]` |
| `maxMessageChars` | 单条写入消息字符上限 | `12000` |
| `info` | 写入元数据（JSON） | `{}` |

### Agent 与共享

| 参数 | 用途 | 官方出厂默认值 |
| --- | --- | --- |
| `multiAgentMode` | 按 Agent 预设隔离记忆 | `false` |
| `allowPublic` | 允许写入项目公共记忆 | `false` |
| `agentId` | Agent ID | 未设置 |
| `appId` | 应用 ID | 未设置 |

### 知识库与过滤

| 参数 | 用途 | 官方出厂默认值 |
| --- | --- | --- |
| `knowledgebaseIds` | 检索知识库 ID | `[]` |
| `allowKnowledgebaseIds` | 允许写入的知识库 ID | `[]` |
| `filter` | 检索过滤条件（JSON） | 未设置 |

### 超时与重试

| 参数 | 用途 | 官方出厂默认值 |
| --- | --- | --- |
| `timeoutMs` | 请求超时（毫秒） | `5000` |
| `searchTimeoutMs` | 检索超时（毫秒） | `min(timeoutMs, 5000)` |
| `searchRetries` | 检索额外重试次数 | `1` |
| `addRetries` | 写入额外重试次数 | `0` |
| `syncAddTimeoutMs` | 同步写入超时（毫秒） | 继承 `timeoutMs` |

`searchTimeoutMs` 未单独设置时取 `min(timeoutMs, 5000)`，`syncAddTimeoutMs` 未单独设置时继承 `timeoutMs`；在基础默认配置下二者均为 5000 毫秒。同步写入超时只在 `asyncMode: false` 时生效。

更完整的参数语义、环境变量优先级和记忆采集行为，以[官方 DSH 文档](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin/blob/main/packages/dsh/README.zh.md)为准。

## 本地隐私筛选（1.2.0）

入口：**设置 → MemOS 记忆 → 本地隐私筛选**。总开关、凭据拦截、手机号脱敏和邮箱脱敏默认开启，自定义规则默认空列表。

| 设置 | 行为 |
| --- | --- |
| 启用本地隐私筛选 | 关闭后恢复原内容发送；配置异常时一律停止 MemOS 请求 |
| 密钥、密码与私钥整轮拦截 | 当前查询命中时跳过召回，并禁止该轮写回；任一当前用户/助手文本命中时禁止整轮写回 |
| 手机号脱敏 | 整体替换为 [手机号已移除]，包含中国大陆 +86 和常见国际写法 |
| 邮箱脱敏 | 整体替换为 [邮箱已移除] |
| 自定义拦截词 | 每行一个字面文本，忽略大小写，命中整轮拦截 |
| 自定义脱敏词 | 每行一个字面文本，替换为 [自定义信息已移除] |

每类自定义规则最多 64 项，每项 1–256 字符，不运行用户正则表达式。拦截优先于脱敏。规则只保存在当前 Profile 的本地文件 memos-panel.privacy.json 中，不混入 MemOS 的 35 项配置。

处理流程：截断前检查完整查询/当前轮 → 先脱敏再执行字符预算 → 对最终请求体复查 → 发往 MemOS。检查查询、选定的消息、工具文本和业务元数据。工具内容仍受官方 includeToolMemory 控制；系统提示词、推理与附件不进入记忆采集。发生解析错误、超出扫描预算或隐私配置异常时，不放行该次请求。

内置规则覆盖常见带格式的 API Key、令牌、密码字段、鉴权文本、数据库凭据和 PEM/SSH 私钥，并检查部分 URL/Base64/Unicode 编码、零宽字符与相邻片段。规则存在漏报和误报，无法识别所有自定义 key 或语义秘密，不能承诺零泄漏。

**用户 ID、Agent ID 等身份字段如包含手机号或邮箱，会拦截该次请求，绝不静默替换成另一记忆用户。账号、API Key、引用名称、服务地址不会因启用隐私筛选而改变。** MemOS 自身鉴权所需的 API Key 仍正常发送到配置的 MemOS 服务；过滤针对请求体中的对话内容。此功能不保护 DSH 向主模型发送的数据，也不清除云端已有记忆。

界面显示适配层是否接入、筛选是否启用、进程内累计拦截检查次数与脱敏字段次数；只保存类型/数量，不保存原始命中内容。重启后统计清零。安装后需重启 DSH 并确认显示“已启用”，不能仅凭开关默认值判断已受保护。

## 数据与隐私

- 兼容运行层只处理准备发给 MemOS 的查询及当前完成轮，不扫描历史会话文件，不导入历史会话，也不读取个人提示词文件。
- 配置通过宿主 Settings API 保存到当前 DSH 配置提供方；面板不把本地配置上传到 GitHub，不收集遥测。
- API Key 只在输入新值时提交至本机宿主；后续状态响应不返回已保存密钥。密钥最终如何落盘及加密取决于宿主，不代表本面板额外提供加密存储。
- 点击「测试连接」会向所填 MemOS 服务发送 API Key、用户 ID、固定测试查询 `MemOS connectivity test` 和测试会话标识。它只调用 `/search/memory`，不会调用写入接口；检索结果内容不返回到设置界面。
- 正式对话使用固定上游 0.1.2 的生命周期、采集、队列与校验逻辑，并由本地筛选控制出网。开启自动保存后，后续完成的对话会按所选参数发送到配置的 MemOS 服务；开启工具记忆时也可能包含工具参数和文本结果。
- 卸载面板不会删除官方插件、其已有设置或 MemOS 云端记忆。

## 更新和卸载

更新前查看 Release 的兼容说明，在 DSH 中用新版安装包更新面板，再完全退出并重新打开应用。部分桌面版本要求先移除面板再添加新版。

只卸载插件列表中的 `dsh-memos-panel` 即可移除界面。保留官方 MemOS 插件时，卸载/停用面板会恢复官方原始运行层，本地隐私筛选随之停止；需要停止全部记忆请求时，应同时关闭召回与写回或停用官方插件。

## 开发与验证

```powershell
git clone https://github.com/lxl2000927/dsh-memos-panel.git
cd dsh-memos-panel
npm test
npm pack --dry-run
npm pack
```

本项目直接提交可运行的 JavaScript，无需构建。兼容运行层使用已安装官方插件提供的依赖和宿主 SDK。完整生命周期测试需要设置 `MEMOS_NATIVE_ENTRY`，并让 Node 能解析宿主 SDK（例如通过测试进程的 `NODE_PATH`）；不设置时默认只运行隔离规则与控制器测试。`npm pack` 只包含运行文件、说明与许可；测试和本地开发资料不打入安装包。

测试默认使用合成配置和本地 HTTP 服务，不需要真实密钥。若要额外核对本机官方插件的 Config 字段，可手动将环境变量 `MEMOS_NATIVE_ENTRY` 指向其 `lib/index.js` 再运行测试；未设置时该项跳过。

| 目录 | 用途 |
| --- | --- |
| `lib/config.js` | 35 项字段元数据、默认值、类型及范围校验 |
| `lib/index.js` | 状态、局部保存与连接测试接口 |
| `client/client.js` | React 设置页面，通过宿主模块加载器使用共享 React |
| `locale/` | 插件元信息 |
| `tests/` | 合成配置、密钥脱敏、局部编辑、重置、注册入口和路由校验测试 |

## 致谢与许可

记忆功能依赖 [MemTensor/MemOS-Cloud-OpenClaw-Plugin](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)，宿主为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。本仓库包含来自 MemOS DSH 0.1.2 的兼容运行层及最小隐私接口修改，不代表上述官方项目。来源与修改记录见 [vendor/SOURCE.md](vendor/SOURCE.md)，上游分发包自带的 Apache-2.0 许可原文保存在 [vendor/LICENSE](vendor/LICENSE)。

自有面板与筛选源码使用 [MIT License](LICENSE)，兼容运行层遵循随附的 Apache-2.0 许可。
